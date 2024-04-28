use crate::authorization::{OrganizationActionPermission, SpaceActionPermission};
use async_graphql::*;

use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::helper::{
    get_conn_from_ctx, get_user_auth_from_ctx, organization_authorize, space_quick_authorize,
};

#[derive(Default)]
pub struct SpaceQuery;

#[Object]
impl SpaceQuery {
    async fn space_get(&self, ctx: &Context<'_>, space_id: i32) -> Result<Space> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ViewSpaceContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let class = Space::find_by_id(&conn, space_id).format_err()?;
        Ok(class)
    }

    async fn space_get_deleted_spaces(&self, ctx: &Context<'_>) -> Result<Vec<Space>> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            user_auth.org_id,
            OrganizationActionPermission::AddSpace,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let classes = Space::find_all_deleted_spaces(&conn, user_auth.org_id).format_err()?;
        Ok(classes)
    }

    // FIXME: Assume that a students and teacher has no more than 100 classes
    // If there are more than 100 classes -> we should use paginated list
    async fn space_get_all_org_spaces(&self, ctx: &Context<'_>) -> Result<Vec<Space>> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            user_auth.org_id,
            OrganizationActionPermission::AddSpace,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let classes = Space::find_all_org_spaces(&conn, user_auth.org_id).format_err()?;
        Ok(classes)
    }

    async fn space_get_my_spaces(&self, ctx: &Context<'_>) -> Result<Vec<Space>> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        Space::find_my_spaces(&conn, user_auth.org_id, user_auth.id).format_err()
    }

    async fn space_get_invite_tokens(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
    ) -> Result<Vec<SpaceInviteToken>> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceMember).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        SpaceInviteToken::find_all_by_spaces(&conn, space_id).format_err()
    }
}
