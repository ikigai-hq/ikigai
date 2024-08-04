pub mod quiz_mutation;
pub mod quiz_query;

pub use quiz_mutation::*;
pub use quiz_query::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::*;
use itertools::Itertools;
use uuid::Uuid;

use crate::authorization::DocumentActionPermission;
use crate::db::{
    ChoiceAnswerData, ChoiceOption, ChoiceQuestionData, ChoiceUserAnswerData,
    FillInBlankAnswerData, FillInBlankQuestionData, FillInBlankUserAnswerData, Quiz, QuizType,
    QuizUserAnswer, SelectAnswerData, SelectQuestionData, SelectUserAnswerData,
    WritingQuestionData,
};
use crate::graphql::data_loader::{FindQuiz, FindQuizUserAnswersByQuiz, IkigaiDataLoader};
use crate::helper::{document_quick_allowed_by_page_content, get_user_id_from_ctx};
use crate::service::ikigai_ai::AIQuizResponse;

#[ComplexObject]
impl Quiz {
    async fn question_data(&self, ctx: &Context<'_>) -> Option<serde_json::Value> {
        document_quick_allowed_by_page_content(
            ctx,
            self.page_content_id,
            DocumentActionPermission::ViewDocument,
        )
        .await
        .ok()?;

        Some(self.question_data.clone())
    }

    async fn answer_data(&self, ctx: &Context<'_>) -> Option<serde_json::Value> {
        document_quick_allowed_by_page_content(
            ctx,
            self.page_content_id,
            DocumentActionPermission::ViewAnswer,
        )
        .await
        .ok()?;

        Some(self.answer_data.clone())
    }

    async fn answers(&self, ctx: &Context<'_>) -> Result<Vec<QuizUserAnswer>> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let answers = loader
            .load_one(FindQuizUserAnswersByQuiz { quiz_id: self.id })
            .await?
            .unwrap_or_default();

        if document_quick_allowed_by_page_content(
            ctx,
            self.page_content_id,
            DocumentActionPermission::EditDocument,
        )
        .await
        .is_ok()
        {
            Ok(answers)
        } else {
            Ok(answers
                .into_iter()
                .filter(|answer| answer.user_id == user_id)
                .collect())
        }
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
        serde_json::from_value(self.question_data(ctx).await.ok()??).ok()
    }

    async fn single_choice_question(&self, ctx: &Context<'_>) -> Option<ChoiceQuestionData> {
        serde_json::from_value(self.question_data(ctx).await.ok()??).ok()
    }

    async fn single_choice_expected_answer(&self, ctx: &Context<'_>) -> Option<ChoiceAnswerData> {
        serde_json::from_value(self.answer_data(ctx).await.ok()??).ok()
    }

    async fn multiple_choice_question(&self, ctx: &Context<'_>) -> Option<ChoiceQuestionData> {
        serde_json::from_value(self.question_data(ctx).await.ok()??).ok()
    }

    async fn multiple_choice_expected_answer(&self, ctx: &Context<'_>) -> Option<ChoiceAnswerData> {
        serde_json::from_value(self.answer_data(ctx).await.ok()??).ok()
    }

    async fn select_option_question(&self, ctx: &Context<'_>) -> Option<SelectQuestionData> {
        serde_json::from_value(self.question_data(ctx).await.ok()??).ok()
    }

    async fn select_option_expected_answer(&self, ctx: &Context<'_>) -> Option<SelectAnswerData> {
        serde_json::from_value(self.answer_data(ctx).await.ok()??).ok()
    }

    async fn fill_in_blank_question(&self, ctx: &Context<'_>) -> Option<FillInBlankQuestionData> {
        serde_json::from_value(self.question_data(ctx).await.ok()??).ok()
    }

    async fn fill_in_blank_expected_answer(
        &self,
        ctx: &Context<'_>,
    ) -> Option<FillInBlankAnswerData> {
        serde_json::from_value(self.answer_data(ctx).await.ok()??).ok()
    }
}

#[ComplexObject]
impl QuizUserAnswer {
    async fn score(&self, ctx: &Context<'_>) -> Option<f64> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let quiz = loader
            .load_one(FindQuiz {
                quiz_id: self.quiz_id,
            })
            .await
            .ok()??;
        document_quick_allowed_by_page_content(
            ctx,
            quiz.page_content_id,
            DocumentActionPermission::ViewAnswer,
        )
        .await
        .ok()?;

        Some(self.score)
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

    async fn fill_in_blank_answer(&self) -> Option<FillInBlankUserAnswerData> {
        self.parse_answer_data()
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename = "camelCase", untagged)]
pub enum CompletionQuestionData {
    ChoiceQuestion(ChoiceQuestionData),
}

scalar!(CompletionQuestionData);

#[derive(Serialize, Deserialize)]
#[serde(rename = "camelCase", untagged)]
pub enum CompletionAnswerData {
    ChoiceQuestion(ChoiceAnswerData),
}

scalar!(CompletionAnswerData);

#[derive(SimpleObject)]
pub struct CompletionFullQuestionData {
    question_data: CompletionQuestionData,
    answer_data: CompletionAnswerData,
}

#[ComplexObject]
impl AIQuizResponse {
    async fn quiz_type(&self) -> QuizType {
        if self.correct_answer.is_some() {
            return QuizType::SingleChoice;
        }

        QuizType::MultipleChoice
    }

    async fn completion_full_data(&self, ctx: &Context<'_>) -> Option<CompletionFullQuestionData> {
        match self.quiz_type(ctx).await {
            Ok(QuizType::SingleChoice) | Ok(QuizType::MultipleChoice) => {
                let options = self.answers.clone();

                let question_data = ChoiceQuestionData {
                    question: self.question.clone(),
                    options: options
                        .into_iter()
                        .map(|option| ChoiceOption {
                            id: Uuid::new_v4(),
                            content: option,
                        })
                        .collect(),
                };

                let mut answers = self.correct_answers.clone().unwrap_or_default();
                if let Some(answer) = self.correct_answer.as_ref() {
                    answers.push(answer.clone());
                }
                let expected_choices = question_data
                    .options
                    .iter()
                    .filter(|option| answers.contains(&option.content))
                    .map(|option| option.id)
                    .collect();
                let answer_data = ChoiceAnswerData { expected_choices };

                Some(CompletionFullQuestionData {
                    question_data: CompletionQuestionData::ChoiceQuestion(question_data),
                    answer_data: CompletionAnswerData::ChoiceQuestion(answer_data),
                })
            }
            _ => None,
        }
    }
}
