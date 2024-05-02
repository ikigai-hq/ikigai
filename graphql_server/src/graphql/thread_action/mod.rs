pub mod thread_mutation;
pub mod thread_query;

pub use thread_mutation::*;
pub use thread_query::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::*;

use crate::db::{Comment, File, PublicUser, Thread};
use crate::graphql::data_loader::{FileById, IkigaiDataLoader, LoadCommentsOfThread};
use crate::helper::get_public_user_from_loader;

#[ComplexObject]
impl Thread {
    async fn comments(&self, ctx: &Context<'_>) -> Result<Vec<Comment>> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();

        let comments = loader
            .load_one(LoadCommentsOfThread { thread_id: self.id })
            .await?
            .unwrap_or_default();

        Ok(comments)
    }

    async fn creator(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        get_public_user_from_loader(ctx, self.creator_id).await
    }
}

#[ComplexObject]
impl Comment {
    async fn sender(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        get_public_user_from_loader(ctx, self.sender_id).await
    }

    async fn file(&self, ctx: &Context<'_>) -> Result<Option<File>> {
        if let Some(file_uuid) = self.file_uuid {
            let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();

            let file = loader
                .load_one(FileById(file_uuid))
                .await?
                .ok_or(format!("Not found file {}", file_uuid))?;

            Ok(Some(file))
        } else {
            Ok(None)
        }
    }
}
