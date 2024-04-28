use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::{quiz_answers, quiz_structures, quizzes};
use crate::error::OpenAssignmentError;
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[sql_type = "Integer"]
pub enum QuizType {
    SingleChoice = 0,
    MultipleChoice = 1,
    FillInBlank = 2,
    SelectOption = 3,
}

impl_enum_for_db!(QuizType);

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[table_name = "quiz_structures"]
#[graphql(input_name = "QuizStructureInput")]
pub struct QuizStructure {
    pub id: Uuid,
    #[graphql(skip_input)]
    pub user_id: i32,
    pub quiz_type: QuizType,
    pub quiz_title: String,
    pub quiz_body: serde_json::Value,
    #[graphql(skip_output)]
    pub quiz_answer: serde_json::Value,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
    #[graphql(skip_input)]
    pub org_id: i32,
    #[graphql(default = "", skip_output)]
    pub explanation: String,
}

impl QuizStructure {
    pub fn upsert(conn: &PgConnection, mut quiz_structure: Self) -> Result<Self, Error> {
        let now = get_now_as_secs();
        quiz_structure.updated_at = now;
        quiz_structure.created_at = now;

        diesel::insert_into(quiz_structures::table)
            .values(&quiz_structure)
            .on_conflict(quiz_structures::id)
            .do_update()
            .set((
                quiz_structures::updated_at.eq(now),
                quiz_structures::quiz_type.eq(quiz_structure.quiz_type),
                quiz_structures::quiz_body.eq(&quiz_structure.quiz_body),
                quiz_structures::quiz_answer.eq(&quiz_structure.quiz_answer),
                quiz_structures::quiz_title.eq(&quiz_structure.quiz_title),
                quiz_structures::explanation.eq(&quiz_structure.explanation),
            ))
            .get_result(conn)
    }

    pub fn update_title(
        conn: &PgConnection,
        quiz_structure_id: Uuid,
        title: String,
    ) -> Result<Self, Error> {
        diesel::update(quiz_structures::table.find(quiz_structure_id))
            .set((
                quiz_structures::updated_at.eq(get_now_as_secs()),
                quiz_structures::quiz_title.eq(title),
            ))
            .get_result(conn)
    }

    pub fn find(conn: &PgConnection, id: Uuid) -> Result<Self, Error> {
        quiz_structures::table.find(id).first(conn)
    }

    pub fn find_by_ids(conn: &PgConnection, ids: Vec<Uuid>) -> Result<Vec<Self>, Error> {
        quiz_structures::table
            .filter(quiz_structures::id.eq_any(ids))
            .get_results(conn)
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[table_name = "quizzes"]
#[graphql(input_name = "QuizInput", complex)]
pub struct Quiz {
    pub id: Uuid,
    pub document_id: Uuid,
    pub quiz_structure_id: Uuid,
    #[graphql(skip_input)]
    pub created_at: i64,
    #[graphql(skip_input)]
    pub deleted_at: Option<i64>,
}

impl Quiz {
    pub fn upsert(conn: &PgConnection, mut item: Self) -> Result<Self, Error> {
        item.created_at = get_now_as_secs();
        diesel::insert_into(quizzes::table)
            .values(&item)
            .on_conflict(quizzes::id)
            .do_update()
            .set((
                quizzes::quiz_structure_id.eq(item.quiz_structure_id),
                quizzes::document_id.eq(item.document_id),
            ))
            .get_result(conn)
    }

    pub fn batch_upsert(conn: &PgConnection, items: Vec<Self>) -> Result<Vec<Self>, Error> {
        diesel::insert_into(quizzes::table)
            .values(items)
            .get_results(conn)
    }

    pub fn find_by_id(conn: &PgConnection, id: Uuid) -> Result<Self, Error> {
        quizzes::table.find(id).first(conn)
    }

    pub fn find_by_ids(conn: &PgConnection, ids: Vec<Uuid>) -> Result<Vec<Self>, Error> {
        quizzes::table
            .filter(quizzes::id.eq_any(ids))
            .get_results(conn)
    }

    pub fn find_all_by_document_id(
        conn: &PgConnection,
        document_id: Uuid,
    ) -> Result<Vec<Self>, Error> {
        quizzes::table
            .filter(quizzes::document_id.eq(document_id))
            .get_results(conn)
    }

    pub fn find_all_by_structure(
        conn: &PgConnection,
        quiz_structure_id: Uuid,
    ) -> Result<Vec<Self>, Error> {
        quizzes::table
            .filter(quizzes::quiz_structure_id.eq(quiz_structure_id))
            .load(conn)
    }

    pub fn soft_remove(conn: &PgConnection, id: Uuid) -> Result<(), Error> {
        diesel::update(quizzes::table.find(id))
            .set(quizzes::deleted_at.eq(get_now_as_secs()))
            .execute(conn)?;

        Ok(())
    }

    pub fn revert(conn: &PgConnection, id: Uuid) -> Result<(), Error> {
        diesel::update(quizzes::table.find(id))
            .set(quizzes::deleted_at.eq(None::<i64>))
            .execute(conn)?;
        Ok(())
    }

    pub fn delete_by_document_id(
        conn: &PgConnection,
        document_id: Uuid,
    ) -> Result<(), OpenAssignmentError> {
        diesel::delete(quizzes::table.filter(quizzes::document_id.eq(document_id)))
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[table_name = "quiz_answers"]
#[graphql(input_name = "QuizAnswerInput", complex)]
pub struct QuizAnswer {
    pub quiz_id: Uuid,
    #[graphql(skip_input)]
    pub user_id: i32,
    pub answer: serde_json::Value,
    #[graphql(skip)]
    pub score: f64,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl QuizAnswer {
    pub fn upsert(conn: &PgConnection, mut item: QuizAnswer) -> Result<Self, Error> {
        let now = get_now_as_secs();
        item.updated_at = now;
        item.created_at = now;

        diesel::insert_into(quiz_answers::table)
            .values(&item)
            .on_conflict((quiz_answers::quiz_id, quiz_answers::user_id))
            .do_update()
            .set((
                quiz_answers::score.eq(&item.score),
                quiz_answers::answer.eq(&item.answer),
                quiz_answers::updated_at.eq(now),
            ))
            .get_result(conn)
    }

    pub fn update_score(
        conn: &PgConnection,
        quiz_id: Uuid,
        user_id: i32,
        score: f64,
    ) -> Result<(), Error> {
        diesel::update(quiz_answers::table.find((quiz_id, user_id)))
            .set((
                quiz_answers::score.eq(score),
                quiz_answers::updated_at.eq(get_now_as_secs()),
            ))
            .execute(conn)?;
        Ok(())
    }

    pub fn find(conn: &PgConnection, quiz_id: Uuid, user_id: i32) -> Result<Self, Error> {
        quiz_answers::table.find((quiz_id, user_id)).first(conn)
    }

    pub fn find_all_by_quiz(conn: &PgConnection, quiz_id: Uuid) -> Result<Vec<Self>, Error> {
        quiz_answers::table
            .filter(quiz_answers::quiz_id.eq(quiz_id))
            .load(conn)
    }

    pub fn find_all_by_quiz_ids(
        conn: &PgConnection,
        quiz_ids: Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        quiz_answers::table
            .filter(quiz_answers::quiz_id.eq_any(quiz_ids))
            .get_results(conn)
    }

    pub fn find_all_by_quiz_ids_and_user(
        conn: &PgConnection,
        quiz_ids: Vec<Uuid>,
        user_id: i32,
    ) -> Result<Vec<Self>, Error> {
        quiz_answers::table
            .filter(quiz_answers::quiz_id.eq_any(quiz_ids))
            .filter(quiz_answers::user_id.eq(user_id))
            .get_results(conn)
    }
}

pub type ChoiceQuizBody = Vec<String>;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SingleChoiceExpectedAnswer {
    pub correct_option: Option<i32>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SingleChoiceUserAnswer {
    pub answer: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MultipleChoiceExpectedAnswer {
    pub correct_options: Vec<i32>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MultipleChoiceUserAnswer {
    pub answer: Vec<i32>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FillBlankExpectedAnswer {
    pub correct_options: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FillBlankUserAnswer {
    pub answer: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SelectOptionsExpectedAnswer {
    pub correct_options: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SelectOptionUserAnswer {
    pub answer: String,
}

pub fn try_get_score(quiz: &QuizStructure, answer: &QuizAnswer) -> f64 {
    match get_score(quiz, answer) {
        Ok(score) => score,
        Err(e) => {
            warn!(
                "Cannot get score of question {:?} by answer {:?}. The error {:?}",
                quiz, answer, e
            );
            0.0
        }
    }
}

pub fn get_score(quiz: &QuizStructure, answer: &QuizAnswer) -> Result<f64, OpenAssignmentError> {
    match quiz.quiz_type {
        QuizType::SingleChoice => {
            let body: ChoiceQuizBody = serde_json::from_value(quiz.quiz_body.clone())?;
            let expected_answer: SingleChoiceExpectedAnswer =
                serde_json::from_value(quiz.quiz_answer.clone())?;
            let user_answer: SingleChoiceUserAnswer =
                serde_json::from_value(answer.answer.clone())?;

            if let Some(correct_option_index) = expected_answer.correct_option {
                if let Some(str_answer) = body.get(correct_option_index as usize) {
                    if Some(str_answer) == user_answer.answer.as_ref() {
                        return Ok(1.0);
                    }
                }
            }
        }
        QuizType::MultipleChoice => {
            let expected_answer: MultipleChoiceExpectedAnswer =
                serde_json::from_value(quiz.quiz_answer.clone())?;
            let user_answer: MultipleChoiceUserAnswer =
                serde_json::from_value(answer.answer.clone())?;

            if user_answer
                .answer
                .iter()
                .any(|answer| !expected_answer.correct_options.contains(answer))
            {
                return Ok(0.0);
            }

            let total_options = user_answer
                .answer
                .iter()
                .filter(|option_index| expected_answer.correct_options.contains(option_index))
                .count();

            return Ok(total_options as f64 / expected_answer.correct_options.len() as f64);
        }
        QuizType::FillInBlank => {
            let expected_answer: FillBlankExpectedAnswer =
                serde_json::from_value(quiz.quiz_answer.clone())?;
            let user_answer: FillBlankUserAnswer = serde_json::from_value(answer.answer.clone())?;

            let user_answer_str = user_answer.answer.trim().to_lowercase();
            return Ok(
                if expected_answer
                    .correct_options
                    .iter()
                    .map(|correct_option| correct_option.trim().to_lowercase())
                    .any(|correct_option| correct_option == user_answer_str)
                {
                    1.0
                } else {
                    0.0
                },
            );
        }
        QuizType::SelectOption => {
            let expected_answer: SelectOptionsExpectedAnswer =
                serde_json::from_value(quiz.quiz_answer.clone())?;
            let user_answer: SelectOptionUserAnswer =
                serde_json::from_value(answer.answer.clone())?;

            let user_answer_str = user_answer.answer.trim().to_lowercase();
            return Ok(
                if expected_answer
                    .correct_options
                    .iter()
                    .map(|correct_option| correct_option.trim().to_lowercase())
                    .any(|correct_option| correct_option == user_answer_str)
                {
                    1.0
                } else {
                    0.0
                },
            );
        }
    };

    Ok(0.0)
}

#[derive(Debug, Clone, SimpleObject)]
pub struct QuizStructureStats {
    pub options: Vec<String>,
    pub count_answers: Vec<usize>,
}

impl QuizStructureStats {
    pub fn get(
        conn: &PgConnection,
        quiz_structure_id: Uuid,
    ) -> Result<Option<QuizStructureStats>, OpenAssignmentError> {
        let quizz_structure = QuizStructure::find(conn, quiz_structure_id)?;
        let quizzes = Quiz::find_all_by_structure(conn, quiz_structure_id)?;
        let quiz_ids = quizzes.iter().map(|quizz| quizz.id).collect();
        let answers = QuizAnswer::find_all_by_quiz_ids(conn, quiz_ids)?;

        let choice_options: ChoiceQuizBody =
            serde_json::from_value(quizz_structure.quiz_body.clone())?;
        Ok(match quizz_structure.quiz_type {
            QuizType::SingleChoice => Some(Self::single_choice_answers(choice_options, answers)?),
            QuizType::MultipleChoice => {
                Some(Self::multiple_choice_answers(choice_options, answers)?)
            }
            _ => None,
        })
    }

    pub fn single_choice_answers(
        options: ChoiceQuizBody,
        answers: Vec<QuizAnswer>,
    ) -> Result<QuizStructureStats, OpenAssignmentError> {
        let mut single_choice_answers = vec![];

        for answer in answers {
            if let Ok(user_answer) =
                serde_json::from_value::<SingleChoiceUserAnswer>(answer.answer.clone())
            {
                single_choice_answers.push(user_answer)
            }
        }

        let mut count_answers = vec![];
        for option in &options {
            let total_answer = single_choice_answers
                .iter()
                .filter(|answer| answer.answer.as_ref() == Some(option))
                .count();
            count_answers.push(total_answer);
        }

        Ok(QuizStructureStats {
            options,
            count_answers,
        })
    }

    pub fn multiple_choice_answers(
        options: ChoiceQuizBody,
        answers: Vec<QuizAnswer>,
    ) -> Result<QuizStructureStats, OpenAssignmentError> {
        let mut multiple_choice_answers = vec![];

        for answer in answers {
            if let Ok(user_answer) =
                serde_json::from_value::<MultipleChoiceUserAnswer>(answer.answer.clone())
            {
                multiple_choice_answers.push(user_answer)
            }
        }

        let mut count_answers = vec![];
        for (index, _option) in options.iter().enumerate() {
            let index = index as i32;
            let total_answer = multiple_choice_answers
                .iter()
                .filter(|answer| answer.answer.contains(&index))
                .count();
            count_answers.push(total_answer);
        }

        Ok(QuizStructureStats {
            options,
            count_answers,
        })
    }
}
