use async_graphql::*;
use diesel::Connection;
use uuid::Uuid;

use crate::authorization::DocumentActionPermission;
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::*;
use crate::util::get_now_as_secs;

#[derive(Default)]
pub struct QuizMutation;

#[Object]
impl QuizMutation {
    async fn quiz_create_structure(
        &self,
        ctx: &Context<'_>,
        mut data: QuizStructure,
    ) -> Result<QuizStructure> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;

        data.user_id = user_auth.id;
        let quiz_structure = QuizStructure::upsert(&conn, data).format_err()?;
        Ok(quiz_structure)
    }

    async fn quiz_update_title(
        &self,
        ctx: &Context<'_>,
        quiz_structure_id: Uuid,
        title: String,
    ) -> Result<QuizStructure> {
        get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let quiz_structure =
            QuizStructure::update_title(&conn, quiz_structure_id, title).format_err()?;
        Ok(quiz_structure)
    }

    async fn quiz_create(&self, ctx: &Context<'_>, data: Quiz) -> Result<Quiz> {
        get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let quiz = Quiz::upsert(&conn, data).format_err()?;
        Ok(quiz)
    }

    async fn quiz_answer(&self, ctx: &Context<'_>, mut data: QuizAnswer) -> Result<QuizAnswer> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        data.user_id = user_id;

        let conn = get_conn_from_ctx(ctx).await?;
        let quiz = Quiz::find_by_id(&conn, data.quiz_id).format_err()?;
        document_authorize(
            ctx,
            user_id,
            quiz.document_id,
            DocumentActionPermission::ViewAnswer,
        )
        .await?;

        let quiz_structure = QuizStructure::find(&conn, quiz.quiz_structure_id).format_err()?;
        data.score = try_get_score(&quiz_structure, &data);
        let quiz_answer = QuizAnswer::upsert(&conn, data).format_err()?;
        Ok(quiz_answer)
    }

    async fn quiz_clone(
        &self,
        ctx: &Context<'_>,
        from_id: Uuid,
        to_id: Uuid,
        to_document_id: Uuid,
    ) -> Result<Quiz> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let quiz = Quiz::find_by_id(&conn, from_id).format_err()?;
        document_authorize(
            ctx,
            user_auth.id,
            quiz.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;

        let new_quiz = conn
            .transaction::<_, IkigaiError, _>(|| {
                let mut quiz_structure = QuizStructure::find(&conn, quiz.quiz_structure_id)?;
                quiz_structure.id = Uuid::new_v4();
                let new_quiz_structure = QuizStructure::upsert(&conn, quiz_structure)?;
                let new_quiz = Quiz {
                    id: to_id,
                    document_id: to_document_id,
                    quiz_structure_id: new_quiz_structure.id,
                    created_at: get_now_as_secs(),
                    deleted_at: None,
                };
                let new_quiz = Quiz::upsert(&conn, new_quiz)?;
                Ok(new_quiz)
            })
            .format_err()?;

        Ok(new_quiz)
    }
}
