use diesel::PgConnection;
use uuid::Uuid;

use crate::db::Document;
use crate::db::*;
use crate::error::IkigaiError;

#[derive(Debug, Clone)]
pub struct DocumentCloneConfig<'a> {
    pub prefix_title: &'a str,
    pub create_new_quiz_structure: bool,
    pub parent_id: Option<Uuid>,
    pub index: i32,
}

impl<'a> DocumentCloneConfig<'a> {
    pub fn new(prefix_title: &'a str, create_new_quiz_structure: bool) -> Self {
        Self {
            prefix_title,
            create_new_quiz_structure,
            parent_id: None,
            index: 0,
        }
    }

    pub fn set_parent(&mut self, parent_id: Option<Uuid>) {
        self.parent_id = parent_id;
    }

    pub fn set_index(&mut self, index: i32) {
        self.index = index;
    }
}

impl Document {
    #[allow(clippy::too_many_arguments)]
    pub fn deep_clone(
        &self,
        conn: &mut PgConnection,
        creator_id: i32,
        config: DocumentCloneConfig,
        clone_to_space: Option<i32>,
        clone_children: bool,
        clone_to_document_id: Option<Uuid>,
        clone_document_type: bool,
    ) -> Result<Self, IkigaiError> {
        let new_title = format!("{}{}", config.prefix_title, self.title);
        let new_cover_photo_id = self.cover_photo_id;

        let document = if let Some(clone_to_document_id) = clone_to_document_id {
            let mut document = Document::find_by_id(conn, clone_to_document_id)?;
            document.title = new_title;
            document.cover_photo_id = new_cover_photo_id;
            document.space_id = clone_to_space;

            document
        } else {
            let new_doc = Document::new(
                creator_id,
                new_title,
                config.parent_id,
                config.index,
                new_cover_photo_id,
                clone_to_space,
                self.icon_type,
                self.icon_value.clone(),
            );
            Document::upsert(conn, new_doc)?
        };
        // Step 1: Change body of document

        // Step 3: Document Type
        if clone_document_type {
            if let Ok(Some(assignment)) = Assignment::find_by_document(conn, self.id) {
                let mut new_assignment = NewAssignment::from(assignment);
                new_assignment.document_id = document.id;
                Assignment::insert(conn, new_assignment)?;
            }

            if let Ok(Some(submission)) = Submission::find_by_document(conn, self.id) {
                let mut new_submission = NewSubmission::from(submission);
                new_submission.document_id = document.id;
                Submission::insert(conn, new_submission)?;
            }
        }

        // Step 4: Clone Child Documents
        if clone_children {
            for child_document in Document::find_by_parent(conn, self.id)? {
                if child_document.deleted_at.is_some() {
                    continue;
                }

                let mut new_config = config.clone();
                new_config.prefix_title = "";
                new_config.index = child_document.index;
                new_config.parent_id = Some(document.id);
                child_document.deep_clone(
                    conn,
                    creator_id,
                    new_config,
                    clone_to_space,
                    clone_children,
                    None,
                    clone_document_type,
                )?;
            }
        }

        Ok(document)
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
