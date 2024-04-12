pub mod file_mutation;
pub mod file_query;

pub use file_mutation::*;
pub use file_query::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::{ComplexObject, Context, Enum, Result};
use uuid::Uuid;

use crate::authorization::DocumentActionPermission;
use crate::db::{File, PublicUser};
use crate::graphql::data_loader::{FindPublicUserById, OpenExamDataLoader};
use crate::helper::{document_quick_authorize, generate_download_url};

#[derive(Enum, Debug, Clone, Copy, Eq, PartialEq)]
pub enum FileType {
    Folder,
    Video,
    Image,
    Document,
    Other,
}

#[ComplexObject]
impl File {
    async fn download_url_by_document_id(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
    ) -> Result<Option<String>> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ViewDocument).await?;
        generate_download_url(self, ctx).await
    }

    async fn public_url(&self) -> Option<String> {
        self.get_public_url()
    }

    async fn user(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let user = loader
            .load_one(FindPublicUserById(self.user_id))
            .await?
            .ok_or(format!("Not found user {}", self.user_id))?;

        Ok(user)
    }
}
