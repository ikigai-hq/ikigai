pub mod document_mutation;
pub mod document_query;

pub use document_mutation::*;
pub use document_query::*;

use crate::authorization::DocumentActionPermission;
use async_graphql::dataloader::DataLoader;
use async_graphql::*;

use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::graphql::data_loader::*;
use crate::helper::{
    document_quick_authorize, generate_download_url, get_conn_from_ctx,
    get_public_user_from_loader, get_user_id_from_ctx,
};

#[ComplexObject]
impl Document {
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
        let mut conn = get_conn_from_ctx(ctx).await?;
        let documents = Document::find_by_parent(&mut conn, self.id).format_err()?;
        Ok(documents)
    }

    async fn document_type(&self, ctx: &Context<'_>) -> Result<DocumentType> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        Ok(loader
            .load_one(FindDocumentType(self.id))
            .await?
            .unwrap_or(DocumentType::Folder))
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

    async fn pages(&self, ctx: &Context<'_>) -> Result<Vec<Page>> {
        if document_quick_authorize(ctx, self.id, DocumentActionPermission::ViewPageContent)
            .await
            .is_ok()
        {
            let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
            Ok(loader
                .load_one(FindPageByDocumentId {
                    document_id: self.id,
                })
                .await?
                .unwrap_or_default())
        } else {
            Ok(vec![])
        }
    }
}

#[ComplexObject]
impl Page {
    async fn page_contents(&self, ctx: &Context<'_>) -> Result<Vec<PageContent>> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let page_contents = loader
            .load_one(FindPageContentByPageId { page_id: self.id })
            .await?
            .unwrap_or_default();
        Ok(page_contents)
    }
}

#[ComplexObject]
impl DocumentAssignedUsers {
    async fn user(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        get_public_user_from_loader(ctx, self.assigned_user_id).await
    }
}
