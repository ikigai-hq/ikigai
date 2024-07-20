use crate::authorization::DocumentActionPermission;
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::{
    create_default_space, document_authorize, get_conn_from_ctx, get_user_from_ctx,
    get_user_id_from_ctx,
};
use async_graphql::*;
use diesel::Connection;
use uuid::Uuid;

#[derive(Default)]
pub struct UserQuery;

#[Object]
impl UserQuery {
    async fn user_me(&self, ctx: &Context<'_>) -> Result<User> {
        let user = get_user_from_ctx(ctx).await?;
        Ok(user)
    }

    async fn user_last_activity(&self, ctx: &Context<'_>) -> Result<UserActivity> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        let last_activity = UserActivity::find(&mut conn, user_id).format_err();
        drop(conn);

        if let Ok(Some(last_document_id)) = last_activity
            .as_ref()
            .map(|activity| activity.last_document_id)
        {
            let is_ok = document_authorize(
                ctx,
                user_id,
                last_document_id,
                DocumentActionPermission::ViewDocument,
            )
            .await
            .is_ok();
            if !is_ok {
                let mut conn = get_conn_from_ctx(ctx).await?;
                let spaces = Space::find_all_by_owner(&mut conn, user_id).format_err()?;
                let activity = conn
                    .transaction::<_, IkigaiError, _>(|conn| {
                        let document = if let Some(space) = spaces.first() {
                            Document::get_or_create_starter_doc(conn, space.id)?
                        } else {
                            let space = create_default_space(conn, user_id)?;
                            Document::get_or_create_starter_doc(conn, space.id)?
                        };

                        let activity = UserActivity::insert(conn, user_id, document.id)?;
                        Ok(activity)
                    })
                    .format_err()?;

                return Ok(activity);
            }
        }

        last_activity
    }

    async fn user_get_my_rubrics(&self, ctx: &Context<'_>) -> Result<Vec<Rubric>> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        Rubric::find_all_by_user(&mut conn, user_id).format_err()
    }

    async fn user_check_document(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
    ) -> Result<Option<i32>> {
        get_user_id_from_ctx(ctx).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        let document = Document::find_by_id(&mut conn, document_id).format_err()?;
        Ok(document.space_id)
    }
}
