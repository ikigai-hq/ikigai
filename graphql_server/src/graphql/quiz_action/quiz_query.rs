use async_graphql::*;
use uuid::Uuid;

use crate::authorization::DocumentActionPermission;
use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::helper::*;

#[derive(Default)]
pub struct QuizQuery;

#[Object]
impl QuizQuery {
    async fn quiz_get(&self, ctx: &Context<'_>, quiz_id: Uuid) -> Result<Quiz> {
        let quiz = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            Quiz::find(&mut conn, quiz_id).format_err()?
        };
        document_quick_allowed_by_page_content(
            ctx,
            quiz.page_content_id,
            DocumentActionPermission::ViewDocument,
        )
        .await?;

        Ok(quiz)
    }
}
