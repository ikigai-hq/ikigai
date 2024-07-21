use async_graphql::*;
use uuid::Uuid;

use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::helper::{get_conn_from_ctx, get_user_from_ctx, get_user_id_from_ctx};

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
        UserActivity::find(&mut conn, user_id).format_err()
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
