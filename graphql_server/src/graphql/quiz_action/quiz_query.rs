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
        let (quiz, page) = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            let quiz = Quiz::find(&mut conn, quiz_id).format_err()?;
            let page_content = PageContent::find(&mut conn, quiz.page_content_id).format_err()?;
            let page = Page::find(&mut conn, page_content.page_id).format_err()?;
            (quiz, page)
        };

        document_quick_authorize(
            ctx,
            page.document_id,
            DocumentActionPermission::ViewDocument,
        )
        .await?;

        Ok(quiz)
    }
}
