use async_graphql::*;
use diesel::Connection;
use uuid::Uuid;

use crate::authorization::{DocumentActionPermission, SpaceActionPermission};
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::{
    create_default_space, document_quick_authorize, get_conn_from_ctx,
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
                Document::get_or_create_starter_doc(conn, space.id)?;
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

    async fn space_get_available_document(
        &self,
        ctx: &Context<'_>,
        current_document_id: Uuid,
    ) -> Result<Option<Document>> {
        let document = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            Document::find_by_id(&mut conn, current_document_id).format_err()?
        };

        let space_id = document.space_id.unwrap_or_default();
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ViewSpaceContent).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        let space_documents = Document::find_all_by_space(&mut conn, space_id).format_err()?;
        for space_document in space_documents {
            let submission =
                Submission::find_by_document(&mut conn, space_document.id).format_err()?;
            if submission.is_none() {
                continue;
            }

            let is_ok = document_quick_authorize(
                ctx,
                space_document.id,
                DocumentActionPermission::ViewDocument,
            )
            .await
            .is_ok();

            if is_ok {
                return Ok(Some(space_document));
            }
        }

        Ok(None)
    }
}
