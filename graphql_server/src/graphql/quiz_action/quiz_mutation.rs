use async_graphql::*;
use uuid::Uuid;

use crate::authorization::DocumentActionPermission;
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::*;
use crate::service::ikigai_ai::{AIQuizzesResponse, GenerateQuizzesRequestData, IkigaiAI};
use crate::util::{end_of_today, start_of_today};

const MAX_AI_USAGE_PER_DAY: i64 = 5;

#[derive(Default)]
pub struct QuizMutation;

#[Object]
impl QuizMutation {
    async fn quiz_upsert(
        &self,
        ctx: &Context<'_>,
        page_content_id: Uuid,
        mut data: Quiz,
    ) -> Result<Quiz> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let page = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            let page_content = PageContent::find(&mut conn, page_content_id).format_err()?;
            Page::find(&mut conn, page_content.page_id).format_err()?
        };
        document_quick_authorize(
            ctx,
            page.document_id,
            DocumentActionPermission::InteractiveWithTool,
        )
        .await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        let existing_quiz_block = Quiz::find(&mut conn, data.id).format_err();
        if let Ok(quiz_block) = existing_quiz_block {
            if quiz_block.page_content_id != page_content_id {
                return Err(IkigaiError::new_bad_request(
                    "Cannot update quiz block of other page",
                ))
                .format_err();
            }
        }

        data.page_content_id = page_content_id;
        data.creator_id = user_id;
        data.original_quiz_id = None;
        let quiz = Quiz::upsert(&mut conn, data).format_err()?;

        Ok(quiz)
    }

    async fn quiz_clone(
        &self,
        ctx: &Context<'_>,
        quiz_id: Uuid,
        new_quiz_id: Uuid,
        new_page_content_id: Uuid,
    ) -> Result<Quiz> {
        let new_page = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            let page_content = PageContent::find(&mut conn, new_page_content_id).format_err()?;
            Page::find(&mut conn, page_content.page_id).format_err()?
        };
        document_quick_authorize(
            ctx,
            new_page.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let (mut quiz, old_page) = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            let quiz_block = Quiz::find(&mut conn, quiz_id).format_err()?;
            let page_content =
                PageContent::find(&mut conn, quiz_block.page_content_id).format_err()?;
            let old_page = Page::find(&mut conn, page_content.page_id).format_err()?;
            (quiz_block, old_page)
        };
        document_quick_authorize(
            ctx,
            old_page.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        quiz.creator_id = get_user_id_from_ctx(ctx).await?;
        quiz.page_content_id = new_page_content_id;
        quiz.id = new_quiz_id;

        let mut conn = get_conn_from_ctx(ctx).await?;
        let existing_new_quiz = Quiz::find(&mut conn, new_quiz_id);
        if existing_new_quiz.is_ok() {
            return Err(IkigaiError::new_bad_request(
                "Quiz block already existed in other pages",
            ))
            .format_err();
        }
        let quiz = Quiz::upsert(&mut conn, quiz).format_err()?;
        Ok(quiz)
    }

    async fn quiz_answer(
        &self,
        ctx: &Context<'_>,
        mut data: QuizUserAnswer,
    ) -> Result<QuizUserAnswer> {
        let (page, quiz) = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            let quiz = Quiz::find(&mut conn, data.quiz_id).format_err()?;
            let page_content = PageContent::find(&mut conn, quiz.page_content_id).format_err()?;
            let page = Page::find(&mut conn, page_content.page_id).format_err()?;
            (page, quiz)
        };
        document_quick_authorize(
            ctx,
            page.document_id,
            DocumentActionPermission::InteractiveWithTool,
        )
        .await?;

        data.user_id = get_user_id_from_ctx(ctx).await?;
        data.score = try_get_auto_score(quiz.quiz_type, quiz.answer_data, data.answer_data.clone());

        let mut conn = get_conn_from_ctx(ctx).await?;
        let quiz_user_answer = QuizUserAnswer::upsert(&mut conn, data).format_err()?;
        Ok(quiz_user_answer)
    }

    async fn quiz_generate_by_ai(
        &self,
        ctx: &Context<'_>,
        quiz_type: QuizType,
        data: GenerateQuizzesRequestData,
    ) -> Result<AIQuizzesResponse> {
        let user_id = get_user_id_from_ctx(ctx).await?;

        // TODO: Replace usage logic by
        let from = start_of_today();
        let to = end_of_today();
        let usage_today = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            AIHistorySession::count_by_time(&mut conn, user_id, from, to).format_err()?
        };
        let max_usage_per_day = std::env::var("IKIGAI_AI_MAX_USAGE_PER_DAY")
            .map(|usage_str| usage_str.parse::<i64>())
            .unwrap_or(Ok(MAX_AI_USAGE_PER_DAY))
            .unwrap_or(MAX_AI_USAGE_PER_DAY);
        if usage_today >= max_usage_per_day {
            return Err(IkigaiError::new_bad_request(
                "You've reached maximum usage of a day. Want more - contact us via rodgers@ikigai.li",
            ))
                .format_err();
        }

        let res = match quiz_type {
            QuizType::SingleChoice => IkigaiAI::generate_single_choice_quizzes(&data).await?,
            QuizType::MultipleChoice => IkigaiAI::generate_multiple_choice_quizzes(&data).await?,
            _ => {
                return Err(IkigaiError::new_bad_request(
                    "We don't support generate this quiz type",
                ))
                .format_err()
            }
        };

        let ai_history = AIHistorySessionBuilder::default()
            .user_id(user_id)
            .request_data(serde_json::to_value(&data).unwrap_or_default())
            .response_data(serde_json::to_value(&res).unwrap_or_default())
            .build()?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        AIHistorySession::insert(&mut conn, ai_history).format_err()?;

        Ok(res)
    }
}
