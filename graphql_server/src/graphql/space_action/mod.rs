pub mod space_mutation;
pub mod space_query;

pub use space_mutation::*;
pub use space_query::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::{ComplexObject, Context, Result};

use crate::authorization::SpaceActionPermission;
use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::graphql::data_loader::{FileById, IkigaiDataLoader, MembersByClassId, SpaceById};
use crate::helper::{
    get_conn_from_ctx, get_public_user_from_loader, get_user_id_from_ctx, space_quick_authorize,
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
        let user_id = get_user_id_from_ctx(ctx).await?;
        space_quick_authorize(ctx, self.id, SpaceActionPermission::ViewSpaceContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Document::get_or_create_starter_doc(&conn, user_id, self.id, self.org_id, self.name.clone())
            .format_err()
    }

    async fn documents(&self, ctx: &Context<'_>) -> Result<Vec<Document>> {
        space_quick_authorize(ctx, self.id, SpaceActionPermission::ViewSpaceContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let documents = Document::find_all_by_space(&conn, self.id).format_err()?;
        Ok(documents)
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
