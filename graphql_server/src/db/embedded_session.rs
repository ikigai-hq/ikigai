use diesel::result::Error;
use diesel::sql_types::{Integer, Jsonb};
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use std::collections::HashMap;
use uuid::Uuid;

use super::schema::{embedded_form_responses, embedded_sessions};
use crate::impl_enum_for_db;
use crate::impl_jsonb_for_db;
use crate::util::get_now_as_secs;

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[diesel(sql_type = Integer)]
pub enum EmbeddedType {
    Normal,
    Form,
}

impl_enum_for_db!(EmbeddedType);

impl Default for EmbeddedType {
    fn default() -> Self {
        Self::Normal
    }
}

#[derive(Debug, Clone, SimpleObject, InputObject, Insertable, Queryable)]
#[graphql(input_name = "EmbeddedSessionInput", complex)]
#[diesel(table_name = embedded_sessions)]
pub struct EmbeddedSession {
    #[graphql(skip_input)]
    pub session_id: Uuid,
    pub document_id: Uuid,
    pub embedded_type: EmbeddedType,
    pub is_active: bool,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl EmbeddedSession {
    pub fn upsert(conn: &mut PgConnection, mut item: Self) -> Result<Self, Error> {
        item.created_at = get_now_as_secs();
        item.updated_at = get_now_as_secs();
        diesel::insert_into(embedded_sessions::table)
            .values(&item)
            .on_conflict(embedded_sessions::session_id)
            .do_update()
            .set((
                embedded_sessions::embedded_type.eq(&item.embedded_type),
                embedded_sessions::is_active.eq(&item.is_active),
                embedded_sessions::updated_at.eq(&item.updated_at),
            ))
            .get_result(conn)
    }

    pub fn find(conn: &mut PgConnection, session_id: Uuid) -> Result<Self, Error> {
        embedded_sessions::table.find(session_id).first(conn)
    }

    pub fn find_by_document(
        conn: &mut PgConnection,
        document_id: Uuid,
    ) -> Result<Option<Self>, Error> {
        match embedded_sessions::table
            .filter(embedded_sessions::document_id.eq(document_id))
            .first(conn)
        {
            Ok(item) => Ok(Some(item)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn find_all_by_document_id(
        conn: &mut PgConnection,
        document_id: Uuid,
    ) -> Result<Vec<Self>, Error> {
        embedded_sessions::table
            .filter(embedded_sessions::document_id.eq(document_id))
            .get_results(conn)
    }
}

#[derive(
    Debug,
    Clone,
    Default,
    Serialize,
    Deserialize,
    SimpleObject,
    InputObject,
    AsExpression,
    FromSqlRow,
)]
#[diesel(sql_type = Jsonb)]
#[graphql(input_name = "EmbeddedResponseDataInput")]
pub struct EmbeddedResponse {
    pub email: String,
    pub phone_number: String,
    pub first_name: String,
    pub last_name: String,
    pub additional_data: HashMap<String, String>,
}

impl_jsonb_for_db!(EmbeddedResponse);

#[derive(Debug, Clone, SimpleObject, InputObject, Insertable, Queryable)]
#[graphql(input_name = "EmbeddedFormResponseInput")]
#[diesel(table_name = embedded_form_responses)]
pub struct EmbeddedSessionResponse {
    #[graphql(skip_input)]
    pub id: Uuid,
    pub session_id: Uuid,
    #[graphql(skip_input)]
    pub submission_id: Option<i32>,
    #[graphql(skip_input)]
    pub response_user_id: i32,
    pub response_data: EmbeddedResponse,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl EmbeddedSessionResponse {
    pub fn upsert(conn: &mut PgConnection, mut item: Self) -> Result<Self, Error> {
        item.created_at = get_now_as_secs();
        diesel::insert_into(embedded_form_responses::table)
            .values(item)
            .get_result(conn)
    }

    pub fn find_all_by_sessions(
        conn: &mut PgConnection,
        session_ids: Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        embedded_form_responses::table
            .filter(embedded_form_responses::session_id.eq_any(session_ids))
            .order_by(embedded_form_responses::created_at.desc())
            .get_results(conn)
    }

    pub fn find_by_submission_id(
        conn: &mut PgConnection,
        submission_id: i32,
    ) -> Result<Option<Self>, Error> {
        match embedded_form_responses::table
            .filter(embedded_form_responses::submission_id.eq(submission_id))
            .first(conn)
        {
            Ok(item) => Ok(Some(item)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }
}
