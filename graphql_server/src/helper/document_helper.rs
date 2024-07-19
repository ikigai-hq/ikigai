use diesel::PgConnection;
use uuid::Uuid;

use crate::db::Document;
use crate::db::*;
use crate::error::IkigaiError;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Builder)]
pub struct DocumentCloneConfig {
    #[builder(default, setter(into))]
    pub prefix_title: String,
    #[builder(default)]
    pub parent_id: Option<Uuid>,
    #[builder(default = "1")]
    pub index: i32,
    pub creator_id: i32,
    #[builder(default)]
    pub clone_to_space: Option<i32>,
    #[builder(default = "true")]
    pub clone_children: bool,
    #[builder(default)]
    pub clone_to_replace_document_id: Option<Uuid>,
    #[builder(default = "true")]
    pub keep_document_type: bool,
}

impl Document {
    pub fn deep_clone(
        &self,
        conn: &mut PgConnection,
        config: DocumentCloneConfig,
    ) -> Result<Self, IkigaiError> {
        let new_title = format!("{}{}", config.prefix_title, self.title);
        let new_cover_photo_id = self.cover_photo_id;

        let new_document = if let Some(clone_to_document_id) = config.clone_to_replace_document_id {
            let mut document = Document::find_by_id(conn, clone_to_document_id)?;
            document.title = new_title;
            document.cover_photo_id = new_cover_photo_id;
            document.space_id = config.clone_to_space;

            document
        } else {
            let new_doc = Document::new(
                config.creator_id,
                new_title,
                config.parent_id,
                config.index,
                new_cover_photo_id,
                config.clone_to_space,
                self.icon_type,
                self.icon_value.clone(),
            );
            Document::upsert(conn, new_doc)?
        };

        // Step 1: Clone pages of document
        let pages = Page::find_all_by_document_id(conn, self.id)?;
        for page in pages {
            page.deep_clone(conn, &new_document)?;
        }

        // Step 2: Document Type
        if config.keep_document_type {
            if let Ok(Some(assignment)) = Assignment::find_by_document(conn, self.id) {
                let mut new_assignment = NewAssignment::from(assignment);
                new_assignment.document_id = new_document.id;
                Assignment::insert(conn, new_assignment)?;
            }

            if let Ok(Some(submission)) = Submission::find_by_document(conn, self.id) {
                let mut new_submission = NewSubmission::from(submission);
                new_submission.document_id = new_document.id;
                Submission::insert(conn, new_submission)?;
            }
        }

        // Step 3: Clone Child Documents
        if config.clone_children {
            for child_document in Document::find_by_parent(conn, self.id)? {
                if child_document.deleted_at.is_some() {
                    continue;
                }

                let new_config = DocumentCloneConfigBuilder::default()
                    .prefix_title("")
                    .index(child_document.index)
                    .parent_id(Some(new_document.id))
                    .creator_id(config.creator_id)
                    .clone_to_space(new_document.space_id)
                    .clone_children(config.clone_children)
                    .keep_document_type(config.keep_document_type)
                    .build()
                    .unwrap();
                child_document.deep_clone(conn, new_config)?;
            }
        }

        Ok(new_document)
    }
}

impl Page {
    pub fn deep_clone(
        &self,
        conn: &mut PgConnection,
        new_document: &Document,
    ) -> Result<Self, IkigaiError> {
        let mut this = self.clone();
        this.id = Uuid::new_v4();
        this.document_id = new_document.id;
        this.updated_at = get_now_as_secs();
        this.created_at = get_now_as_secs();
        this.created_by_id = new_document.creator_id;

        let new_page = Page::upsert(conn, this)?;

        let page_contents = PageContent::find_all_by_page(conn, self.id)?;
        for page_content in page_contents {
            page_content.deep_clone(conn, &new_page, new_document.creator_id)?;
        }

        Ok(new_page)
    }
}

impl PageContent {
    pub fn deep_clone(
        &self,
        conn: &mut PgConnection,
        new_page: &Page,
        creator_id: i32,
    ) -> Result<Self, IkigaiError> {
        let new_content =
            PageContent::new(Uuid::new_v4(), new_page.id, self.index, self.body.clone());
        let mut new_page_content = PageContent::upsert(conn, new_content)?;

        let mut new_content = new_page_content.get_json_content();

        let quizzes = Quiz::find_all_by_page_contents(conn, &vec![self.id])?;
        for quiz in quizzes {
            if let Ok(new_quiz) = quiz.deep_clone(conn, &new_page_content, creator_id) {
                new_content.replace_block_id(
                    new_quiz.quiz_type.block_name(),
                    new_quiz.quiz_type.id_name(),
                    &serde_json::to_value(quiz.id).unwrap_or_default(),
                    &serde_json::to_value(new_quiz.id).unwrap_or_default(),
                );
            }
        }

        new_page_content.body = serde_json::to_value(new_content).unwrap_or_default();
        Ok(PageContent::upsert(conn, new_page_content)?)
    }
}

impl Quiz {
    pub fn deep_clone(
        &self,
        conn: &mut PgConnection,
        new_page_content: &PageContent,
        creator_id: i32,
    ) -> Result<Self, IkigaiError> {
        let mut new_quiz = self.clone();
        new_quiz.id = Uuid::new_v4();
        new_quiz.page_content_id = new_page_content.id;
        new_quiz.creator_id = creator_id;
        new_quiz.original_quiz_id = Some(self.id);
        Ok(Quiz::upsert(conn, new_quiz)?)
    }
}

pub fn get_all_documents_by_id(
    conn: &mut PgConnection,
    document_id: Uuid,
) -> Result<Vec<Document>, IkigaiError> {
    let mut res: Vec<Document> = vec![];
    let mut child_documents = Document::find_by_parent(conn, document_id)?;
    res.append(&mut child_documents);

    for document in child_documents {
        res.append(&mut get_all_documents_by_id(conn, document.id)?);
    }

    Ok(res)
}

pub fn delete_document(
    conn: &mut PgConnection,
    document_id: Uuid,
    include_children: bool,
) -> Result<(), IkigaiError> {
    let mut document_ids = vec![document_id];
    if include_children {
        document_ids.append(
            &mut get_all_documents_by_id(conn, document_id)?
                .iter()
                .map(|document| document.id)
                .collect(),
        );
    };

    Document::soft_delete_by_ids(conn, document_ids, Some(get_now_as_secs()))?;
    Ok(())
}
