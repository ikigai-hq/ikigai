use async_graphql::*;
use diesel::Connection;
use uuid::Uuid;

use crate::authorization::{SpaceActionPermission};
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::{
    create_default_space, get_conn_from_ctx,
    get_space_allowed_permissions, get_user_id_from_ctx, space_quick_authorize,
};

#[derive(Default)]
pub struct SpaceQuery;

#[Object]
impl SpaceQuery {
    async fn space_my_permissions(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
    ) -> Result<Vec<SpaceActionPermission>> {
        get_space_allowed_permissions(ctx, space_id).await
    }

    async fn space_get(&self, ctx: &Context<'_>, space_id: i32) -> Result<Space> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ViewSpaceContent).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        let class = Space::find_by_id(&mut conn, space_id).format_err()?;
        Ok(class)
    }

    async fn space_mine(&self, ctx: &Context<'_>) -> Result<Vec<Space>> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        Space::find_my_spaces(&mut conn, user_id).format_err()
    }

    async fn space_own(&self, ctx: &Context<'_>) -> Result<Vec<Space>> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        let spaces = Space::find_all_by_owner(&mut conn, user_id).format_err()?;
        if !spaces.is_empty() {
            return Ok(spaces);
        }

        Ok(vec![conn
            .transaction::<_, IkigaiError, _>(|conn| {
                let space = create_default_space(conn, user_id)?;
                Ok(space)
            })
            .format_err()?])
    }

    async fn space_get_invite_tokens(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
    ) -> Result<Vec<SpaceInviteToken>> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceMember).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        SpaceInviteToken::find_all_by_spaces(&mut conn, space_id).format_err()
    }

    async fn space_get_space_by_document(
        &self,
        ctx: &Context<'_>,
        current_document_id: Uuid,
    ) -> Result<Option<i32>> {
        let document = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            Document::find_by_id(&mut conn, current_document_id).format_err()?
        };

        if let Some(space_id) = document.space_id {
            space_quick_authorize(ctx, space_id, SpaceActionPermission::ViewSpaceContent).await?;
        }

        Ok(document.space_id)
    }
}
