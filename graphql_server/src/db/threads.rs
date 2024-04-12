use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::{thread_comments, threads};
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Insertable, InputObject)]
#[table_name = "threads"]
pub struct NewThread {
    pub creator_id: i32,
    pub title: String,
    #[graphql(skip)]
    pub updated_at: i64,
    #[graphql(skip)]
    pub created_at: i64,
}

impl NewThread {
    pub fn update_time(&mut self) {
        self.updated_at = get_now_as_secs();
        self.created_at = get_now_as_secs();
    }
}

#[derive(Debug, Clone, Queryable, SimpleObject)]
#[graphql(complex)]
pub struct Thread {
    pub id: i32,
    pub creator_id: i32,
    pub title: String,
    pub updated_at: i64,
    pub created_at: i64,
}

impl Thread {
    pub fn insert(conn: &PgConnection, mut new_thread: NewThread) -> Result<Self, Error> {
        new_thread.update_time();
        diesel::insert_into(threads::table)
            .values(new_thread)
            .get_result(conn)
    }

    pub fn find_by_id(conn: &PgConnection, thread_id: i32) -> Result<Self, Error> {
        threads::table.find(thread_id).first(conn)
    }

    pub fn find_all_by_ids(conn: &PgConnection, thread_ids: Vec<i32>) -> Result<Vec<Self>, Error> {
        threads::table
            .filter(threads::id.eq_any(thread_ids))
            .get_results(conn)
    }

    pub fn remove(conn: &PgConnection, thread_id: i32) -> Result<(), Error> {
        diesel::delete(threads::table.find(thread_id)).execute(conn)?;
        Ok(())
    }
}

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[sql_type = "Integer"]
pub enum ThreadCommentType {
    Text = 0,
    File = 1,
}

impl_enum_for_db!(ThreadCommentType);

impl Default for ThreadCommentType {
    fn default() -> Self {
        Self::Text
    }
}

#[derive(Debug, Clone, Insertable, InputObject)]
#[table_name = "thread_comments"]
pub struct NewComment {
    pub thread_id: i32,
    #[graphql(skip)]
    pub sender_id: i32,
    pub content: String,
    #[graphql(skip)]
    pub updated_at: i64,
    #[graphql(skip)]
    pub created_at: i64,
    #[graphql(default)]
    pub comment_type: ThreadCommentType,
    #[graphql(default)]
    pub file_uuid: Option<Uuid>,
}

impl NewComment {
    pub fn update_time(&mut self) {
        self.updated_at = get_now_as_secs();
        self.created_at = get_now_as_secs();
    }
}

#[derive(Debug, Clone, Queryable, SimpleObject)]
#[graphql(complex)]
pub struct Comment {
    pub id: i64,
    pub thread_id: i32,
    pub sender_id: i32,
    pub content: String,
    pub updated_at: i64,
    pub created_at: i64,
    pub comment_type: ThreadCommentType,
    pub file_uuid: Option<Uuid>,
}

impl Comment {
    pub fn insert(conn: &PgConnection, mut new_comment: NewComment) -> Result<Self, Error> {
        new_comment.update_time();
        diesel::insert_into(thread_comments::table)
            .values(&new_comment)
            .get_result(conn)
    }

    pub fn find_by_id(conn: &PgConnection, comment_id: i64) -> Result<Self, Error> {
        thread_comments::table.find(comment_id).first(conn)
    }

    pub fn find_all_by_threads(
        conn: &PgConnection,
        thread_ids: Vec<i32>,
    ) -> Result<Vec<Self>, Error> {
        thread_comments::table
            .filter(thread_comments::thread_id.eq_any(thread_ids))
            .order_by(thread_comments::created_at.asc())
            .get_results(conn)
    }

    pub fn remove(conn: &PgConnection, comment_id: i64) -> Result<(), Error> {
        diesel::delete(thread_comments::table.find(comment_id)).execute(conn)?;
        Ok(())
    }
}
