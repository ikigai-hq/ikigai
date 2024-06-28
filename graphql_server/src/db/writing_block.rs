use diesel::result::Error;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::writing_blocks;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[graphql(input_name = "WritingBlockInput")]
#[diesel(table_name = writing_blocks)]
pub struct WritingBlock {
    pub id: Uuid,
    #[graphql(skip_input)]
    pub page_content_id: Uuid,
    #[graphql(skip_input)]
    pub creator_id: i32,
    pub content: serde_json::Value,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl WritingBlock {
    pub fn upsert(conn: &mut PgConnection, mut item: Self) -> Result<Self, Error> {
        item.created_at = get_now_as_secs();
        item.updated_at = get_now_as_secs();

        diesel::insert_into(writing_blocks::table)
            .values(&item)
            .on_conflict(writing_blocks::id)
            .do_update()
            .set((
                writing_blocks::page_content_id.eq(&item.page_content_id),
                writing_blocks::creator_id.eq(&item.creator_id),
                writing_blocks::content.eq(&item.content),
                writing_blocks::updated_at.eq(&item.updated_at),
            ))
            .get_result(conn)
    }

    pub fn find(conn: &mut PgConnection, id: Uuid) -> Result<Self, Error> {
        writing_blocks::table.find(id).first(conn)
    }

    pub fn find_all_by_page_content(
        conn: &mut PgConnection,
        page_content_id: Uuid,
    ) -> Result<Vec<Self>, Error> {
        writing_blocks::table
            .filter(writing_blocks::page_content_id.eq(page_content_id))
            .get_results(conn)
    }
}
