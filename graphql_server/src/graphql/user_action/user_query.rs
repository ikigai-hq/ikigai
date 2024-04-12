use crate::db::*;
use crate::error::OpenExamErrorExt;
use crate::graphql::paging::PagingInput;
use crate::helper::{get_conn_from_ctx, get_user_from_ctx, get_user_id_from_ctx};
use crate::util::get_now_as_secs;
use async_graphql::*;

#[derive(InputObject)]
pub struct AnnouncementFilter {
    pub from_id: Option<i32>,
    pub paging: PagingInput,
}

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
}
