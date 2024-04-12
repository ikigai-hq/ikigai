use async_graphql::*;

use crate::db::*;
use crate::error::{OpenExamError, OpenExamErrorExt};
use crate::helper::*;

#[derive(Default)]
pub struct ThreadMutation;

#[Object]
impl ThreadMutation {
    async fn add_comment(&self, ctx: &Context<'_>, mut new_comment: NewComment) -> Result<Comment> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        new_comment.sender_id = user_id;
        let conn = get_conn_from_ctx(ctx).await?;
        let comment = Comment::insert(&conn, new_comment).format_err()?;
        Ok(comment)
    }

    async fn remove_comment(&self, ctx: &Context<'_>, comment_id: i64) -> Result<bool> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let comment = Comment::find_by_id(&conn, comment_id).format_err()?;
        if user_id != comment.sender_id {
            return Err(OpenExamError::new_bad_request("Incorrect sender")).format_err()?;
        }
        Comment::remove(&conn, comment_id).format_err()?;

        Ok(true)
    }
}
