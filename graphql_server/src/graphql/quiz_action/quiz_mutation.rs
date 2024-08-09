use async_graphql::*;
use serde::Serialize;
use uuid::Uuid;

use crate::authorization::DocumentActionPermission;
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::*;
use crate::service::ikigai_ai::{
    AIFillInBlankQuiz, AIGenerateQuizResponse, AIMultipleChoiceQuiz, AISingleChoiceQuiz,
    GenerateQuizzesRequestData, IkigaiAI,
};
use crate::util::var_util::{
    read_integer_val_with_default, AI_USAGE_PER_DAY_KEY, MAX_AI_USAGE_PER_DAY,
};
use crate::util::{end_of_today, start_of_today};

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
    ) -> Result<AIGenerateQuizResponse> {
        let user_id = get_user_id_from_ctx(ctx).await?;

        // TODO: Replace usage logic by
        let from = start_of_today();
        let to = end_of_today();
        let usage_today = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            AIHistorySession::count_by_time(&mut conn, user_id, from, to).format_err()?
        };
        let max_usage_per_day =
            read_integer_val_with_default(AI_USAGE_PER_DAY_KEY, MAX_AI_USAGE_PER_DAY);
        if usage_today >= max_usage_per_day as i64 {
            return Err(IkigaiError::new_bad_request(
                "You've reached maximum usage of a day. Want more - contact us via rodgers@ikigai.li",
            ))
                .format_err();
        }

        let res = match quiz_type {
            QuizType::SingleChoice => IkigaiAI::generate_single_choice_quizzes(&data).await?,
            QuizType::MultipleChoice => IkigaiAI::generate_multiple_choice_quizzes(&data).await?,
            QuizType::FillInBlank => IkigaiAI::generate_fill_in_blank(&data).await?,
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

    async fn quiz_convert_ai_quiz(
        &self,
        ctx: &Context<'_>,
        page_content_id: Uuid,
        data: AIGenerateQuizInput,
    ) -> Result<Vec<Quiz>> {
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

        let AIGenerateQuizInput {
            single_choice_data,
            multiple_choice_data,
            fill_in_blank_data,
        } = data;
        let mut quizzes: Vec<Quiz> = vec![];
        quizzes.append(
            &mut single_choice_data
                .into_iter()
                .filter_map(|quiz| {
                    let (question, answer) = quiz.get_quiz_data();
                    build_quiz(
                        user_id,
                        page_content_id,
                        QuizType::SingleChoice,
                        question,
                        answer,
                    )
                })
                .collect(),
        );

        quizzes.append(
            &mut multiple_choice_data
                .into_iter()
                .filter_map(|quiz| {
                    let (question, answer) = quiz.get_quiz_data();
                    build_quiz(
                        user_id,
                        page_content_id,
                        QuizType::MultipleChoice,
                        question,
                        answer,
                    )
                })
                .collect(),
        );
        quizzes.append(
            &mut fill_in_blank_data
                .into_iter()
                .filter_map(|quiz| {
                    let (question, answer) = quiz.get_quiz_data();
                    build_quiz(
                        user_id,
                        page_content_id,
                        QuizType::FillInBlank,
                        question,
                        answer,
                    )
                })
                .collect(),
        );

        let mut conn = get_conn_from_ctx(ctx).await?;
        let quizzes = Quiz::batch_insert(&mut conn, &quizzes).format_err()?;
        Ok(quizzes)
    }
}

#[derive(Debug, Clone, InputObject)]
#[graphql(input_name = "AIGenerateQuizInput")]
pub struct AIGenerateQuizInput {
    pub single_choice_data: Vec<AISingleChoiceQuiz>,
    pub multiple_choice_data: Vec<AIMultipleChoiceQuiz>,
    pub fill_in_blank_data: Vec<AIFillInBlankQuiz>,
}

fn build_quiz<Q: Serialize, A: Serialize>(
    creator_id: i32,
    page_content_id: Uuid,
    quiz_type: QuizType,
    question_data: Q,
    answer_data: A,
) -> Option<Quiz> {
    QuizBuilder::default()
        .creator_id(creator_id)
        .page_content_id(page_content_id)
        .quiz_type(quiz_type)
        .question_data(serde_json::to_value(question_data).unwrap_or_default())
        .answer_data(serde_json::to_value(answer_data).unwrap_or_default())
        .build()
        .ok()
}
