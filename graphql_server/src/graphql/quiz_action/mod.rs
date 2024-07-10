pub mod quiz_mutation;
pub mod quiz_query;

pub use quiz_mutation::*;
pub use quiz_query::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::*;
use itertools::Itertools;

use crate::authorization::DocumentActionPermission;
use crate::db::{
    ChoiceAnswerData, ChoiceQuestionData, ChoiceUserAnswerData, FillInBlankAnswerData,
    FillInBlankQuestionData, Quiz, QuizUserAnswer, SelectAnswerData, SelectQuestionData,
    SelectUserAnswerData, WritingQuestionData,
};
use crate::graphql::data_loader::{FindQuiz, FindQuizUserAnswersByQuiz, IkigaiDataLoader};
use crate::helper::{document_quick_allowed_by_page_content, get_user_id_from_ctx};

#[ComplexObject]
impl Quiz {
    async fn question_data(&self, ctx: &Context<'_>) -> Result<serde_json::Value> {
        document_quick_allowed_by_page_content(
            ctx,
            self.page_content_id,
            DocumentActionPermission::ViewDocument,
        )
        .await?;

        Ok(self.question_data.clone())
    }

    async fn answer_data(&self, ctx: &Context<'_>) -> Result<serde_json::Value> {
        document_quick_allowed_by_page_content(
            ctx,
            self.page_content_id,
            DocumentActionPermission::ViewAnswer,
        )
        .await?;

        Ok(self.question_data.clone())
    }

    async fn answers(&self, ctx: &Context<'_>) -> Result<Vec<QuizUserAnswer>> {
        document_quick_allowed_by_page_content(
            ctx,
            self.page_content_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let answers = loader
            .load_one(FindQuizUserAnswersByQuiz { quiz_id: self.id })
            .await?
            .unwrap_or_default();
        Ok(answers)
    }

    async fn my_answer(&self, ctx: &Context<'_>) -> Result<Option<QuizUserAnswer>> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let mut answers = loader
            .load_one(FindQuizUserAnswersByQuiz { quiz_id: self.id })
            .await?
            .unwrap_or_default();

        let user_id = get_user_id_from_ctx(ctx).await?;
        Ok(
            if let Some((index, _)) = answers
                .iter()
                .find_position(|answer| answer.user_id == user_id)
            {
                Some(answers.remove(index))
            } else {
                None
            },
        )
    }

    async fn writing_question(&self, ctx: &Context<'_>) -> Option<WritingQuestionData> {
        serde_json::from_value(self.question_data(ctx).await.ok()?).ok()
    }

    async fn single_choice_question(&self, ctx: &Context<'_>) -> Option<ChoiceQuestionData> {
        serde_json::from_value(self.question_data(ctx).await.ok()?).ok()
    }

    async fn single_choice_expected_answer(&self, ctx: &Context<'_>) -> Option<ChoiceAnswerData> {
        serde_json::from_value(self.answer_data(ctx).await.ok()?).ok()
    }

    async fn multiple_choice_question(&self, ctx: &Context<'_>) -> Option<ChoiceQuestionData> {
        serde_json::from_value(self.question_data(ctx).await.ok()?).ok()
    }

    async fn multiple_choice_expected_answer(&self, ctx: &Context<'_>) -> Option<ChoiceAnswerData> {
        serde_json::from_value(self.answer_data(ctx).await.ok()?).ok()
    }

    async fn select_option_question(&self, ctx: &Context<'_>) -> Option<SelectQuestionData> {
        serde_json::from_value(self.question_data(ctx).await.ok()?).ok()
    }

    async fn select_option_expected_answer(&self, ctx: &Context<'_>) -> Option<SelectAnswerData> {
        serde_json::from_value(self.answer_data(ctx).await.ok()?).ok()
    }

    async fn fill_in_blank_question(&self, ctx: &Context<'_>) -> Option<FillInBlankQuestionData> {
        serde_json::from_value(self.question_data(ctx).await.ok()?).ok()
    }

    async fn fill_in_blank_expected_answer(
        &self,
        ctx: &Context<'_>,
    ) -> Option<FillInBlankAnswerData> {
        serde_json::from_value(self.answer_data(ctx).await.ok()?).ok()
    }
}

#[ComplexObject]
impl QuizUserAnswer {
    async fn score(&self, ctx: &Context<'_>) -> Result<f64> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let quiz = loader
            .load_one(FindQuiz {
                quiz_id: self.quiz_id,
            })
            .await?
            .ok_or(format!("Not found quiz {}", self.quiz_id))?;
        document_quick_allowed_by_page_content(
            ctx,
            quiz.page_content_id,
            DocumentActionPermission::ViewAnswer,
        )
        .await?;

        Ok(self.score)
    }

    async fn single_choice_answer(&self) -> Option<ChoiceUserAnswerData> {
        self.parse_answer_data()
    }

    async fn multiple_choice_answer(&self) -> Option<ChoiceUserAnswerData> {
        self.parse_answer_data()
    }

    async fn select_option_answer(&self) -> Option<SelectUserAnswerData> {
        self.parse_answer_data()
    }

    async fn fill_in_blank_answer(&self) -> Option<SelectUserAnswerData> {
        self.parse_answer_data()
    }
}
