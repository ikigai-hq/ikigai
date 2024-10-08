use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use serde::de::DeserializeOwned;
use serde::Serialize;
use serde_json::Value;
use std::clone::Clone;
use uuid::Uuid;

use super::schema::{quiz_blocks, quiz_user_answer};
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    FromPrimitive,
    ToPrimitive,
    AsExpression,
    FromSqlRow,
    Enum,
    Serialize,
    Deserialize,
)]
#[diesel(sql_type = Integer)]
#[serde(rename_all = "snake_case")]
pub enum QuizType {
    WritingBlock,
    FillInBlank,
    SelectOption,
    SingleChoice,
    MultipleChoice,
}

impl_enum_for_db!(QuizType);

impl QuizType {
    pub fn block_name(&self) -> &str {
        match self {
            QuizType::WritingBlock => "writingBlock",
            QuizType::FillInBlank => "fillInBlank",
            QuizType::SelectOption => "selectOption",
            QuizType::SingleChoice => "singleChoice",
            QuizType::MultipleChoice => "multipleChoice",
        }
    }

    pub fn id_name(&self) -> &str {
        "quizId"
    }
}

pub const ALL_QUIZ_TYPES: [QuizType; 5] = [
    QuizType::WritingBlock,
    QuizType::FillInBlank,
    QuizType::SelectOption,
    QuizType::SingleChoice,
    QuizType::MultipleChoice,
];

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject, Builder)]
#[graphql(input_name = "QuizInput", complex)]
#[diesel(table_name = quiz_blocks)]
pub struct Quiz {
    #[builder(default = "Uuid::new_v4()")]
    pub id: Uuid,
    #[graphql(skip_input)]
    pub page_content_id: Uuid,
    #[graphql(skip_input)]
    pub creator_id: i32,
    #[graphql(skip_input)]
    #[builder(default)]
    pub original_quiz_id: Option<Uuid>,
    pub quiz_type: QuizType,
    #[graphql(skip_output)]
    pub question_data: Value,
    #[graphql(skip_output)]
    pub answer_data: Value,
    #[graphql(skip_input)]
    #[builder(default = "get_now_as_secs()")]
    pub updated_at: i64,
    #[graphql(skip_input)]
    #[builder(default = "get_now_as_secs()")]
    pub created_at: i64,
}

impl Quiz {
    pub fn upsert(conn: &mut PgConnection, mut item: Self) -> Result<Self, Error> {
        item.created_at = get_now_as_secs();
        item.updated_at = get_now_as_secs();

        diesel::insert_into(quiz_blocks::table)
            .values(&item)
            .on_conflict(quiz_blocks::id)
            .do_update()
            .set((
                quiz_blocks::page_content_id.eq(&item.page_content_id),
                quiz_blocks::creator_id.eq(&item.creator_id),
                quiz_blocks::original_quiz_id.eq(&item.original_quiz_id),
                quiz_blocks::quiz_type.eq(&item.quiz_type),
                quiz_blocks::question_data.eq(&item.question_data),
                quiz_blocks::answer_data.eq(&item.answer_data),
                quiz_blocks::updated_at.eq(&item.updated_at),
            ))
            .get_result(conn)
    }

    pub fn batch_insert(conn: &mut PgConnection, items: &Vec<Self>) -> Result<Vec<Self>, Error> {
        diesel::insert_into(quiz_blocks::table)
            .values(items)
            .on_conflict_do_nothing()
            .get_results(conn)
    }

    pub fn find(conn: &mut PgConnection, id: Uuid) -> Result<Self, Error> {
        quiz_blocks::table.find(id).first(conn)
    }

    pub fn find_all(conn: &mut PgConnection, ids: &Vec<Uuid>) -> Result<Vec<Self>, Error> {
        quiz_blocks::table
            .filter(quiz_blocks::id.eq_any(ids))
            .get_results(conn)
    }

    pub fn find_all_by_page_contents(
        conn: &mut PgConnection,
        page_content_ids: &Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        quiz_blocks::table
            .filter(quiz_blocks::page_content_id.eq_any(page_content_ids))
            .get_results(conn)
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[graphql(input_name = "QuizUserAnswerInput", complex)]
#[diesel(table_name = quiz_user_answer)]
pub struct QuizUserAnswer {
    pub quiz_id: Uuid,
    #[graphql(skip_input)]
    pub user_id: i32,
    pub answer_data: Value,
    #[graphql(skip)]
    pub score: f64,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl QuizUserAnswer {
    pub fn upsert(conn: &mut PgConnection, mut item: Self) -> Result<Self, Error> {
        item.updated_at = get_now_as_secs();
        item.created_at = get_now_as_secs();

        diesel::insert_into(quiz_user_answer::table)
            .values(&item)
            .on_conflict((quiz_user_answer::quiz_id, quiz_user_answer::user_id))
            .do_update()
            .set((
                quiz_user_answer::answer_data.eq(&item.answer_data),
                quiz_user_answer::score.eq(&item.score),
                quiz_user_answer::updated_at.eq(&item.updated_at),
            ))
            .get_result(conn)
    }

    pub fn find(conn: &mut PgConnection, quiz_id: Uuid, user_id: i32) -> Result<Self, Error> {
        quiz_user_answer::table
            .find((quiz_id, user_id))
            .get_result(conn)
    }

    pub fn find_opt(
        conn: &mut PgConnection,
        quiz_id: Uuid,
        user_id: i32,
    ) -> Result<Option<Self>, Error> {
        match Self::find(conn, quiz_id, user_id) {
            Ok(item) => Ok(Some(item)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn find_all_by_quizzes(
        conn: &mut PgConnection,
        quiz_ids: &Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        quiz_user_answer::table
            .filter(quiz_user_answer::quiz_id.eq_any(quiz_ids))
            .get_results(conn)
    }

    pub fn find_all_by_quizzes_and_user(
        conn: &mut PgConnection,
        quiz_ids: &Vec<Uuid>,
        user_id: i32,
    ) -> Result<Vec<Self>, Error> {
        quiz_user_answer::table
            .filter(quiz_user_answer::user_id.eq(user_id))
            .filter(quiz_user_answer::quiz_id.eq_any(quiz_ids))
            .get_results(conn)
    }

    pub fn parse_answer_data<T: DeserializeOwned>(&self) -> Option<T> {
        serde_json::from_value(self.answer_data.clone()).ok()
    }
}

pub fn try_get_auto_score(quiz_type: QuizType, expected_answer: Value, answer: Value) -> f64 {
    get_auto_store(quiz_type, expected_answer, answer).unwrap_or_default()
}

pub fn get_auto_store(quiz_type: QuizType, expected_answer: Value, answer: Value) -> Option<f64> {
    match quiz_type {
        QuizType::SingleChoice => {
            let choice_expected_answer: ChoiceAnswerData =
                serde_json::from_value(expected_answer).ok()?;
            let user_answer: ChoiceUserAnswerData = serde_json::from_value(answer).ok()?;
            if let Some(choice) = user_answer.choices.first() {
                if choice_expected_answer.expected_choices.contains(choice) {
                    return Some(1.0);
                }
            }
        }
        QuizType::MultipleChoice => {
            let choice_expected_answer: ChoiceAnswerData =
                serde_json::from_value(expected_answer).ok()?;
            let user_answer: ChoiceUserAnswerData = serde_json::from_value(answer).ok()?;

            if choice_expected_answer.expected_choices.is_empty() {
                return Some(0.0);
            }

            let has_incorrect_choice = user_answer
                .choices
                .iter()
                .any(|choice| !choice_expected_answer.expected_choices.contains(choice));
            if has_incorrect_choice {
                return Some(0.0);
            }

            let total_correct_choice = choice_expected_answer
                .expected_choices
                .iter()
                .filter(|expected_choice| user_answer.choices.contains(expected_choice))
                .count();
            return Some(
                total_correct_choice as f64 / choice_expected_answer.expected_choices.len() as f64,
            );
        }
        QuizType::SelectOption => {
            let choice_expected_answer: SelectAnswerData =
                serde_json::from_value(expected_answer).ok()?;
            let user_answer: SelectUserAnswerData = serde_json::from_value(answer).ok()?;
            if choice_expected_answer
                .expected_choices
                .contains(&user_answer.choice)
            {
                return Some(1.0);
            }
        }
        QuizType::FillInBlank => {
            let fill_in_blank_expected_answer: FillInBlankAnswerData =
                serde_json::from_value(expected_answer).ok()?;
            let user_answer: FillInBlankUserAnswerData = serde_json::from_value(answer).ok()?;
            let has_correct_answer =
                fill_in_blank_expected_answer
                    .expected_answers
                    .iter()
                    .any(|expected_answer| {
                        expected_answer.content.to_lowercase().trim()
                            == user_answer.answer.to_lowercase().trim()
                    });

            if has_correct_answer {
                return Some(1.0);
            }
        }
        _ => (),
    };

    Some(0.0)
}

// Writing Block
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[serde(rename_all = "camelCase")]
pub struct WritingQuestionData {
    pub content: Value,
}

// Single Choice, Multiple Choice Block
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[serde(rename_all = "camelCase")]
pub struct ChoiceOption {
    pub id: Uuid,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[serde(rename_all = "camelCase")]
pub struct ChoiceQuestionData {
    pub question: String,
    pub options: Vec<ChoiceOption>,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[serde(rename_all = "camelCase")]
pub struct ChoiceAnswerData {
    pub expected_choices: Vec<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[serde(rename_all = "camelCase")]
pub struct ChoiceUserAnswerData {
    pub choices: Vec<Uuid>,
}

// Select Options
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[serde(rename_all = "camelCase")]
pub struct SelectQuestionData {
    pub options: Vec<ChoiceOption>,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[serde(rename_all = "camelCase")]
pub struct SelectAnswerData {
    pub expected_choices: Vec<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[serde(rename_all = "camelCase")]
pub struct SelectUserAnswerData {
    pub choice: Uuid,
}

// Fill in Blank
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[serde(rename_all = "camelCase")]
pub struct FillInBlankQuestionData {
    pub content: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[serde(rename_all = "camelCase")]
pub struct FillInBlankAnswerData {
    pub expected_answers: Vec<ChoiceOption>,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[serde(rename_all = "camelCase")]
pub struct FillInBlankUserAnswerData {
    pub answer: String,
}
