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
    FillInBlankAnswerData, FillInBlankQuestionData, FillInBlankUserAnswerData, Quiz,
    QuizUserAnswer, SelectAnswerData, SelectQuestionData, SelectUserAnswerData,
    WritingQuestionData,
};
use crate::graphql::data_loader::{FindQuiz, FindQuizUserAnswersByQuiz, IkigaiDataLoader};
use crate::helper::{document_quick_allowed_by_page_content, get_user_id_from_ctx};
use crate::service::ikigai_ai::{
    AIFillInBlankQuiz, AIMultipleChoiceQuiz, AISelectOptionQuiz, AISingleChoiceQuiz,
};

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

impl AISingleChoiceQuiz {
    pub fn get_quiz_data(self) -> (ChoiceQuestionData, ChoiceAnswerData) {
        let AISingleChoiceQuiz {
            question,
            answers,
            correct_answer,
        } = self;

        let options: Vec<ChoiceOption> = answers
            .into_iter()
            .map(|answer| ChoiceOption {
                id: Uuid::new_v4(),
                content: answer,
            })
            .collect();
        let question = ChoiceQuestionData { question, options };

        let expected_choices = question
            .options
            .iter()
            .filter(|option| option.content == correct_answer)
            .map(|option| option.id)
            .collect();
        let expected_answer_data = ChoiceAnswerData { expected_choices };

        (question, expected_answer_data)
    }
}

impl AIMultipleChoiceQuiz {
    pub fn get_quiz_data(self) -> (ChoiceQuestionData, ChoiceAnswerData) {
        let AIMultipleChoiceQuiz {
            question,
            answers,
            correct_answers,
        } = self;

        let options: Vec<ChoiceOption> = answers
            .into_iter()
            .map(|answer| ChoiceOption {
                id: Uuid::new_v4(),
                content: answer,
            })
            .collect();
        let question = ChoiceQuestionData { question, options };

        let expected_choices = question
            .options
            .iter()
            .filter(|option| correct_answers.contains(&option.content))
            .map(|option| option.id)
            .collect();
        let expected_answer_data = ChoiceAnswerData { expected_choices };

        (question, expected_answer_data)
    }
}

impl AIFillInBlankQuiz {
    pub fn get_quiz_data(self) -> (FillInBlankQuestionData, FillInBlankAnswerData) {
        let AIFillInBlankQuiz {
            position: _,
            correct_answer,
        } = self;

        let question = FillInBlankQuestionData { content: None };

        let expected_answer = ChoiceOption {
            id: Uuid::new_v4(),
            content: correct_answer,
        };
        let expected_answer_data = FillInBlankAnswerData {
            expected_answers: vec![expected_answer],
        };

        (question, expected_answer_data)
    }
}

impl AISelectOptionQuiz {
    pub fn get_quiz_data(self) -> (SelectQuestionData, SelectAnswerData) {
        let AISelectOptionQuiz {
            position: _,
            correct_answer,
            answers,
        } = self;

        let options: Vec<ChoiceOption> = answers
            .into_iter()
            .map(|answer| ChoiceOption {
                id: Uuid::new_v4(),
                content: answer,
            })
            .collect();
        let question = SelectQuestionData { options };

        let expected_answer_data = SelectAnswerData {
            expected_choices: question
                .options
                .iter()
                .filter(|option| option.content == correct_answer)
                .map(|option| option.id)
                .collect(),
        };

        (question, expected_answer_data)
    }
}
