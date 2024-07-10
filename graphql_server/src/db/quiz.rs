use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use serde::de::DeserializeOwned;
use serde::Serialize;
use uuid::Uuid;

use super::schema::{quiz_blocks, quiz_user_answer};
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[diesel(sql_type = Integer)]
pub enum QuizType {
    WritingBlock,
    FillInBlank,
    SelectOptions,
    SingleChoice,
    MultipleChoice,
}

impl_enum_for_db!(QuizType);

impl QuizType {
    pub fn block_name(&self) -> &str {
        match self {
            QuizType::WritingBlock => "writingBlock",
            QuizType::FillInBlank => "fillInBlank",
            QuizType::SelectOptions => "selectOptions",
            QuizType::SingleChoice => "singleChoice",
            QuizType::MultipleChoice => "multipleChoice",
        }
    }

    pub fn id_name(&self) -> &str {
        "quizId"
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[graphql(input_name = "QuizInput", complex)]
#[diesel(table_name = quiz_blocks)]
pub struct Quiz {
    pub id: Uuid,
    #[graphql(skip_input)]
    pub page_content_id: Uuid,
    #[graphql(skip_input)]
    pub creator_id: i32,
    #[graphql(skip_input)]
    pub original_quiz_id: Option<Uuid>,
    pub quiz_type: QuizType,
    #[graphql(skip_output)]
    pub question_data: serde_json::Value,
    #[graphql(skip_output)]
    pub answer_data: serde_json::Value,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
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

    pub fn parse_question_data<T: DeserializeOwned>(&self) -> Option<T> {
        serde_json::from_value(self.question_data.clone()).ok()
    }

    pub fn parse_answer_data<T: DeserializeOwned>(&self) -> Option<T> {
        serde_json::from_value(self.answer_data.clone()).ok()
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[graphql(input_name = "QuizUserAnswerInput", complex)]
#[diesel(table_name = quiz_user_answer)]
pub struct QuizUserAnswer {
    pub quiz_id: Uuid,
    #[graphql(skip_input)]
    pub user_id: i32,
    pub answer_data: serde_json::Value,
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

    pub fn parse_answer_data<T: DeserializeOwned>(&self) -> Option<T> {
        serde_json::from_value(self.answer_data.clone()).ok()
    }
}

// Writing Block
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct WritingBlockUserAnswer {
    pub content: serde_json::Value,
}
