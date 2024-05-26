use diesel::PgConnection;
use uuid::Uuid;

use crate::db::Document;
use crate::db::*;
use crate::error::IkigaiError;

#[derive(Debug, Clone, Builder)]
pub struct DocumentCloneConfig<'a> {
    pub prefix_title: &'a str,
    pub parent_id: Option<Uuid>,
    pub index: i32,
    pub creator_id: i32,
    pub clone_to_space: Option<i32>,
    pub clone_children: bool,
    pub clone_to_replace_document_id: Option<Uuid>,
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

        let document = if let Some(clone_to_document_id) = config.clone_to_replace_document_id {
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
        // Step 1: Change body of document

        // Step 3: Document Type
        if config.keep_document_type {
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
        if config.clone_children {
            for child_document in Document::find_by_parent(conn, self.id)? {
                if child_document.deleted_at.is_some() {
                    continue;
                }

                let new_config = DocumentCloneConfigBuilder::default()
                    .prefix_title("")
                    .index(child_document.index)
                    .parent_id(child_document.parent_id)
                    .creator_id(config.creator_id)
                    .clone_to_space(config.clone_to_space)
                    .clone_children(config.clone_children)
                    .keep_document_type(config.keep_document_type)
                    .build()
                    .unwrap();
                child_document.deep_clone(conn, new_config)?;
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
