pub mod document_mutation;
pub mod document_query;

pub use document_mutation::*;
pub use document_query::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::*;
use itertools::Itertools;

use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::graphql::data_loader::*;
use crate::helper::{
    generate_download_url, get_conn_from_ctx, get_public_user_from_loader, get_user_id_from_ctx,
};

#[ComplexObject]
impl Document {
    async fn quizzes(&self, ctx: &Context<'_>) -> Result<Vec<Quiz>> {
        let conn = get_conn_from_ctx(ctx).await?;
        let quizzes = Quiz::find_all_by_document_id(&conn, self.id).format_err()?;
        Ok(quizzes)
    }

    async fn highlights(&self, ctx: &Context<'_>) -> Result<Vec<DocumentHighlight>> {
        let conn = get_conn_from_ctx(ctx).await?;
        let items = DocumentHighlight::find_all_by_document(&conn, self.id).format_err()?;
        Ok(items)
    }

    async fn assignment(&self, ctx: &Context<'_>) -> Result<Option<Assignment>> {
        if get_user_id_from_ctx(ctx).await.is_err() {
            return Ok(None);
        }

        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let assignment = loader.load_one(AssignmentByDocumentId(self.id)).await?;
        Ok(assignment)
    }

    async fn submission(&self, ctx: &Context<'_>) -> Result<Option<Submission>> {
        if get_user_id_from_ctx(ctx).await.is_err() {
            return Ok(None);
        }

        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let submission = loader.load_one(SubmissionByDocumentId(self.id)).await?;
        Ok(submission)
    }

    async fn space(&self, ctx: &Context<'_>) -> Result<Option<Space>> {
        if get_user_id_from_ctx(ctx).await.is_err() {
            return Ok(None);
        }

        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let space = loader.load_one(SpaceByDocumentId(self.id)).await?;
        Ok(space)
    }

    async fn children(&self, ctx: &Context<'_>) -> Result<Vec<Document>> {
        let conn = get_conn_from_ctx(ctx).await?;
        let documents = Document::find_by_parent(&conn, self.id).format_err()?;
        Ok(documents)
    }

    async fn document_type(&self, ctx: &Context<'_>) -> Result<DocumentType> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        Ok(loader
            .load_one(FindDocumentType(self.id))
            .await?
            .unwrap_or(DocumentType::Normal))
    }

    async fn page_blocks(&self, ctx: &Context<'_>) -> Result<Vec<PageBlock>> {
        let conn = get_conn_from_ctx(ctx).await?;
        PageBlock::find_all_by_document(&conn, self.id).format_err()
    }

    async fn cover_photo_url(&self, ctx: &Context<'_>) -> Option<String> {
        if let Some(cover_photo_id) = self.cover_photo_id {
            let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
            let file = loader.load_one(FileById(cover_photo_id)).await.ok()??;
            generate_download_url(&file, ctx).await.ok()?
        } else {
            None
        }
    }

    async fn updated_by(&self, ctx: &Context<'_>) -> Option<PublicUser> {
        if let Some(updated_by) = self.updated_by {
            get_public_user_from_loader(ctx, updated_by).await.ok()
        } else {
            None
        }
    }

    async fn assigned_users(&self, ctx: &Context<'_>) -> Vec<DocumentAssignedUser> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        loader
            .load_one(FindDocumentAssignedUsers {
                document_id: self.id,
            })
            .await
            .unwrap_or_default()
            .unwrap_or_default()
    }
}

#[ComplexObject]
impl DocumentHighlight {
    async fn thread(&self, ctx: &Context<'_>) -> Result<Thread> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let thread = loader
            .load_one(ThreadById(self.thread_id))
            .await?
            .ok_or(format!("Not found thread {}", self.thread_id))?;

        Ok(thread)
    }
}

#[ComplexObject]
impl PageBlock {
    async fn nested_documents(&self, ctx: &Context<'_>) -> Result<Vec<PageBlockDocument>> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let nested_documents = loader
            .load_one(FindNestedDocumentsOfPageBlock {
                page_block_id: self.id,
            })
            .await?
            .unwrap_or_default();

        Ok(nested_documents
            .into_iter()
            .sorted_by(|a, b| Ord::cmp(&a.index, &b.index))
            .collect())
    }
}

#[ComplexObject]
impl PageBlockDocument {
    async fn document(&self, ctx: &Context<'_>) -> Result<Document> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let document = loader
            .load_one(DocumentById(self.document_id))
            .await?
            .ok_or(format!("Not found document {}", self.document_id))?;
        Ok(document)
    }
}
