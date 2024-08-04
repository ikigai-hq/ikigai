use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{PgConnection, RunQueryDsl};
use serde_json::Value;
use uuid::Uuid;

use super::schema::ai_history_sessions;
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[diesel(sql_type = Integer)]
pub enum AIAction {
    GenerateQuizzes,
}

impl_enum_for_db!(AIAction);

impl Default for AIAction {
    fn default() -> Self {
        Self::GenerateQuizzes
    }
}

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[diesel(sql_type = Integer)]
pub enum UserReactionAIResponse {
    None,
    Like,
    Dislike,
}

impl_enum_for_db!(UserReactionAIResponse);

impl Default for UserReactionAIResponse {
    fn default() -> Self {
        Self::None
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, Builder)]
#[diesel(table_name = ai_history_sessions)]
pub struct AIHistorySession {
    #[builder(default = "Uuid::new_v4()")]
    pub id: Uuid,
    pub user_id: i32,
    #[builder(default)]
    pub action: AIAction,
    pub request_data: Value,
    pub response_data: Value,
    #[builder(default)]
    pub user_reaction: UserReactionAIResponse,
    #[builder(default = "get_now_as_secs()")]
    pub updated_at: i64,
    #[builder(default = "get_now_as_secs()")]
    pub created_at: i64,
}

impl AIHistorySession {
    pub fn insert(conn: &mut PgConnection, item: Self) -> Result<Self, Error> {
        diesel::insert_into(ai_history_sessions::table)
            .values(&item)
            .get_result(conn)
    }
}
