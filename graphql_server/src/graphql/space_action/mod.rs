pub mod space_mutation;
pub mod space_query;

pub use space_mutation::*;
pub use space_query::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::{ComplexObject, Context, Result};

use crate::authorization::{DocumentActionPermission, SpaceActionPermission};
use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::graphql::data_loader::{FileById, IkigaiDataLoader, MembersByClassId, SpaceById};
use crate::helper::{
    document_quick_authorize, get_conn_from_ctx, get_public_user_from_loader, get_user_id_from_ctx,
    space_quick_authorize,
};

#[ComplexObject]
impl Space {
    async fn creator(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        get_public_user_from_loader(ctx, self.creator_id).await
    }

    async fn banner(&self, ctx: &Context<'_>) -> Option<File> {
        if let Some(banner_id) = self.banner_id {
            let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
            loader.load_one(FileById(banner_id)).await.ok().flatten()
        } else {
            None
        }
    }

    async fn members(&self, ctx: &Context<'_>) -> Result<Vec<SpaceMember>> {
        if space_quick_authorize(ctx, self.id, SpaceActionPermission::ManageSpaceMember)
            .await
            .is_ok()
        {
            let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
            let students = loader
                .load_one(MembersByClassId(self.id))
                .await?
                .unwrap_or_default();
            Ok(students)
        } else {
            Ok(vec![])
        }
    }

    async fn starter_document(&self, ctx: &Context<'_>) -> Result<Document> {
        get_user_id_from_ctx(ctx).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        Document::get_or_create_starter_doc(&mut conn, self.id).format_err()
    }

    async fn documents(&self, ctx: &Context<'_>) -> Result<Vec<Document>> {
        space_quick_authorize(ctx, self.id, SpaceActionPermission::ViewSpaceContent).await?;

        let documents = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            Document::find_all_by_space(&mut conn, self.id).format_err()?
        };

        let mut res = vec![];
        for document in documents {
            if document_quick_authorize(ctx, document.id, DocumentActionPermission::ViewDocument)
                .await
                .is_ok()
            {
                res.push(document);
            }
        }

        Ok(res)
    }
}

#[ComplexObject]
impl SpaceMember {
    async fn user(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        get_public_user_from_loader(ctx, self.user_id).await
    }

    async fn space(&self, ctx: &Context<'_>) -> Result<Space> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let space = loader
            .load_one(SpaceById(self.space_id))
            .await?
            .ok_or(format!("Not found space {}", self.space_id))?;
        Ok(space)
    }
}

#[ComplexObject]
impl SpaceInviteToken {
    async fn creator(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        get_public_user_from_loader(ctx, self.creator_id).await
    }
}
