use crate::db::*;
use crate::error::OpenAssignmentErrorExt;
use crate::helper::{get_conn_from_ctx, get_user_from_ctx, get_user_id_from_ctx};
use crate::util::get_now_as_secs;
use async_graphql::*;
use uuid::Uuid;

#[derive(Default)]
pub struct UserQuery;

#[Object]
impl UserQuery {
    async fn user_me(&self, ctx: &Context<'_>) -> Result<User> {
        let user = get_user_from_ctx(ctx).await?;
        Ok(user)
    }

    async fn user_my_submissions(
        &self,
        ctx: &Context<'_>,
        submit_from: Option<i64>,
        submit_to: Option<i64>,
    ) -> Result<Vec<Submission>> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let submit_to = submit_to.unwrap_or(get_now_as_secs());
        let submit_from = submit_from.unwrap_or(submit_to - 2_592_000); // 30 days in secs
        Submission::find_all_by_user(&conn, user_id, submit_from, submit_to).format_err()
    }

    async fn user_last_activity(&self, ctx: &Context<'_>) -> Result<UserActivity> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        UserActivity::find(&conn, user_id).format_err()
    }

    // FIXME: Replace this step by using new authorization logic
    // Currently, open exam use active org id, so this step is necessary to get org id before do any action
    // However, it can be replaced by authorization logic and not rely on active org id
    async fn user_check_document(&self, ctx: &Context<'_>, document_id: Uuid) -> Result<i32> {
        get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let document = Document::find_by_id(&conn, document_id).format_err()?;
        Ok(document.org_id)
    }
}
