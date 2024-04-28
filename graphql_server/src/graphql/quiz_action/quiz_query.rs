use crate::authorization::DocumentActionPermission;
use async_graphql::*;
use uuid::Uuid;

use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::helper::*;

#[derive(Default)]
pub struct QuizQuery;

#[Object]
impl QuizQuery {
    async fn quiz_get(&self, ctx: &Context<'_>, quiz_id: Uuid) -> Result<Quiz> {
        let conn = get_conn_from_ctx(ctx).await?;
        let quiz = Quiz::find_by_id(&conn, quiz_id).format_err()?;
        document_quick_authorize(
            ctx,
            quiz.document_id,
            DocumentActionPermission::ViewDocument,
        )
        .await?;
        Ok(quiz)
    }

    async fn quiz_get_stats(
        &self,
        ctx: &Context<'_>,
        quiz_id: Uuid,
    ) -> Result<Option<QuizStructureStats>> {
        let quiz = {
            let conn = get_conn_from_ctx(ctx).await?;
            Quiz::find_by_id(&conn, quiz_id).format_err()?
        };
        document_quick_authorize(
            ctx,
            quiz.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let stats = QuizStructureStats::get(&conn, quiz.quiz_structure_id).format_err()?;
        Ok(stats)
    }

    async fn quiz_get_all_structure_answers(
        &self,
        ctx: &Context<'_>,
        quiz_structure_id: Uuid,
    ) -> Result<Vec<QuizAnswer>> {
        let conn = get_conn_from_ctx(ctx).await?;
        let quizzes = Quiz::find_all_by_structure(&conn, quiz_structure_id).format_err()?;
        let quizz_ids = quizzes.iter().map(|quiz| quiz.id).collect();
        let answers = QuizAnswer::find_all_by_quiz_ids(&conn, quizz_ids).format_err()?;
        Ok(answers)
    }
}
