use std::collections::HashMap;

use diesel::{Connection, PgConnection};
use regex::Regex;
use uuid::Uuid;

use crate::db::Document;
use crate::db::*;
use crate::error::OpenExamError;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone)]
pub struct DocumentCloneConfig<'a> {
    pub prefix_title: &'a str,
    pub create_new_quiz_structure: bool,
    pub parent_id: Option<Uuid>,
    pub index: i32,
    pub org_id: Option<i32>,
}

impl<'a> DocumentCloneConfig<'a> {
    pub fn new(prefix_title: &'a str, create_new_quiz_structure: bool) -> Self {
        Self {
            prefix_title,
            create_new_quiz_structure,
            parent_id: None,
            index: 0,
            org_id: None,
        }
    }

    pub fn set_parent(&mut self, parent_id: Option<Uuid>) {
        self.parent_id = parent_id;
    }

    pub fn set_index(&mut self, index: i32) {
        self.index = index;
    }

    pub fn set_org(&mut self, org_id: i32) {
        self.org_id = Some(org_id);
    }
}

impl PageBlock {
    pub fn deep_clone(
        &self,
        conn: &PgConnection,
        to_document: &mut Document,
        document_config: &DocumentCloneConfig,
        check_and_replace_page_block_id: bool,
        new_id: Uuid,
    ) -> Result<Option<Self>, OpenExamError> {
        let id = self.id.to_string();
        if check_and_replace_page_block_id && !to_document.body.contains(id.as_str()) {
            return Ok(None);
        }

        // Clone Page Block
        let mut page_block = self.clone();
        page_block.id = new_id;
        page_block.document_id = to_document.id;
        let page_block = PageBlock::upsert(conn, page_block)?;

        // Clone Nested Document of Page Block
        let page_block_documents: HashMap<Uuid, PageBlockDocument> =
            PageBlockDocument::find_all_by_page_block(conn, self.id)?
                .into_iter()
                .map(|pb_document| (pb_document.document_id, pb_document))
                .collect();
        let document_ids = page_block_documents.iter().map(|p| *p.0).collect();
        for document in Document::find_by_ids(conn, document_ids)? {
            if let Some(pb_document) = page_block_documents.get(&document.id) {
                let mut config = document_config.clone();
                config.prefix_title = "";
                config.parent_id = None;
                config.index = 0;
                let new_document =
                    document.deep_clone(conn, to_document.creator_id, config, None, false, None)?;
                let page_block_nested_document =
                    PageBlockDocument::new(page_block.id, new_document.id, pb_document.index);
                PageBlockDocument::upsert(conn, page_block_nested_document)?;
            }
        }

        to_document.body = to_document
            .body
            .replace(id.as_str(), page_block.id.to_string().as_str());

        Ok(Some(page_block))
    }
}

impl Quiz {
    pub fn deep_clone(
        &self,
        conn: &PgConnection,
        to_document: &mut Document,
        clone_new_quiz_structure: bool,
    ) -> Result<Option<Self>, OpenExamError> {
        let id = self.id.to_string();
        if !to_document.body.contains(id.as_str()) {
            return Ok(None);
        }

        // Clone Quiz Structure if needed
        let quiz_structure_id = if clone_new_quiz_structure {
            let mut quiz_structure = QuizStructure::find(conn, self.quiz_structure_id)?;
            quiz_structure.id = Uuid::new_v4();
            let quiz_structure = QuizStructure::upsert(conn, quiz_structure)?;
            quiz_structure.id
        } else {
            self.quiz_structure_id
        };

        // Clone Quiz
        let mut new_quiz = self.clone();
        new_quiz.id = Uuid::new_v4();
        new_quiz.document_id = to_document.id;
        new_quiz.quiz_structure_id = quiz_structure_id;
        let quiz = Quiz::upsert(conn, new_quiz)?;

        to_document.body = to_document
            .body
            .replace(id.as_str(), quiz.id.to_string().as_str());
        Ok(Some(quiz))
    }
}

impl Document {
    pub fn deep_clone(
        &self,
        conn: &PgConnection,
        creator_id: i32,
        config: DocumentCloneConfig,
        clone_to_space: Option<i32>,
        clone_children: bool,
        clone_to_document_id: Option<Uuid>,
    ) -> Result<Self, OpenExamError> {
        let new_body = self.body.clone();
        let new_title = format!("{}{}", config.prefix_title, self.title);
        let new_org_id = config.org_id.unwrap_or(self.org_id);
        let new_editor_config = self.editor_config.clone();
        let new_cover_photo_id = self.cover_photo_id;

        let mut document = if let Some(clone_to_document_id) = clone_to_document_id {
            let mut document = Document::find_by_id(conn, clone_to_document_id)?;
            document.title = new_title;
            document.body = new_body;
            document.org_id = new_org_id;
            document.cover_photo_id = new_cover_photo_id;
            document.editor_config = new_editor_config;
            document.space_id = clone_to_space;

            document
        } else {
            let new_doc = Document::new(
                creator_id,
                new_body,
                new_title,
                config.org_id.unwrap_or(self.org_id),
                config.parent_id,
                config.index,
                new_cover_photo_id,
                self.hide_rule,
                new_editor_config,
                clone_to_space,
            );
            Document::upsert(conn, new_doc)?
        };

        // Clean Comments
        let comment_regex = Regex::new(
            r"(&&[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12};#;(?P<content>.*?)&&)",
        ).unwrap();
        document.body = comment_regex
            .replace_all(&document.body, "$content")
            .to_string();

        // Step 1: Change body of document
        //  1.1 Quizzes, 1.2 Rate, 1.3 Chart, 1.4 Page Block
        let quizzes = Quiz::find_all_by_document_id(conn, self.id)?;
        for quiz in quizzes {
            quiz.deep_clone(conn, &mut document, config.create_new_quiz_structure)?;
        }

        for page_block in PageBlock::find_all_by_document(conn, self.id)? {
            page_block.deep_clone(conn, &mut document, &config, true, Uuid::new_v4())?;
        }

        Document::update(
            conn,
            document.id,
            UpdateDocumentData {
                title: document.title.clone(),
                body: document.body.clone(),
                cover_photo_id: document.cover_photo_id,
                editor_config: document.editor_config.clone(),
                updated_at: get_now_as_secs(),
                updated_by: None,
                last_edited_content_at: get_now_as_secs(),
            },
        )?;

        // Step 3: Document Type
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
                )?;
            }
        }

        Ok(document)
    }
}

pub fn get_all_documents_by_id(
    conn: &PgConnection,
    document_id: Uuid,
) -> Result<Vec<Document>, OpenExamError> {
    let mut res: Vec<Document> = vec![];
    let mut child_documents = Document::find_by_parent(conn, document_id)?;
    res.append(&mut child_documents);

    for document in child_documents {
        res.append(&mut get_all_documents_by_id(conn, document.id)?);
    }

    Ok(res)
}

pub fn available_for_student(document: &Document, student_id: i32) -> bool {
    if document.creator_id == student_id {
        return true;
    }

    match document.hide_rule {
        HideRule::Public => true,
        HideRule::Private => false,
    }
}

pub fn create_a_document_version(
    conn: &PgConnection,
    creator_id: i32,
    root_document: &Document,
    name: &str,
    version_creator_id: Option<i32>,
) -> Result<DocumentVersion, OpenExamError> {
    let version = conn.transaction::<_, OpenExamError, _>(|| {
        // Step 1: Clone a versioning document
        let mut config = DocumentCloneConfig::new("", true);
        config.org_id = Some(root_document.org_id);
        let versioning_document =
            root_document.deep_clone(conn, creator_id, config, None, false, None)?;

        // Step 2: Create Version
        let document_version = DocumentVersion::quick_new(
            name.into(),
            root_document.id,
            versioning_document.id,
            version_creator_id,
        );
        Ok(DocumentVersion::upsert(conn, document_version)?)
    })?;

    Ok(version)
}

pub fn restore_document(
    conn: &PgConnection,
    org_id: i32,
    user_id: i32,
    document_id: Uuid,
    backup_document_id: Uuid,
) -> Result<Document, OpenExamError> {
    let page_blocks = PageBlock::find_all_by_document(conn, document_id)?;
    let page_block_ids = page_blocks.iter().map(|page_block| page_block.id).collect();
    let page_block_documents = PageBlockDocument::find_all_by_page_blocks(conn, page_block_ids)?;

    let backup_document = Document::find_by_id(conn, backup_document_id)?;
    conn.transaction::<_, OpenExamError, _>(|| {
        // Step 1: Remove outdated data
        Quiz::delete_by_document_id(conn, document_id)?;
        for page_block_document in page_block_documents {
            Document::delete(conn, page_block_document.document_id)?;
        }
        PageBlock::delete_by_document(conn, document_id)?;

        // Step 2: Clone template document -> current document with current document id
        let mut config = DocumentCloneConfig::new("", true);
        config.set_org(org_id);
        let duplicated_document =
            backup_document.deep_clone(conn, user_id, config, None, false, Some(document_id))?;

        Ok(duplicated_document)
    })
}

pub fn duplicate_document_to_class(
    conn: &PgConnection,
    original_document_id: Uuid,
    class_id: i32,
) -> Result<Document, OpenExamError> {
    let original_document = Document::find_by_id(conn, original_document_id)?;
    let duplicated_document = conn.transaction::<_, OpenExamError, _>(|| {
        let mut config = DocumentCloneConfig::new("", true);
        config.set_org(original_document.org_id);
        let duplicated_document = original_document.deep_clone(
            conn,
            original_document.creator_id,
            config,
            Some(class_id),
            true,
            None,
        )?;

        Ok(duplicated_document)
    })?;

    Ok(duplicated_document)
}
