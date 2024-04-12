use async_graphql::*;

use crate::db::*;
use crate::error::OpenExamErrorExt;
use crate::helper::*;

#[derive(Default)]
pub struct ThreadQuery;

#[Object]
impl ThreadQuery {
    async fn thread_get(&self, ctx: &Context<'_>, thread_id: i32) -> Result<Thread> {
        get_user_id_from_ctx(ctx).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let thread = Thread::find_by_id(&conn, thread_id).format_err()?;
        Ok(thread)
    }
}
