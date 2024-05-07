use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::{page_contents, pages};
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[sql_type = "Integer"]
pub enum PageLayout {
    Horizontal,
    Vertical,
}

impl_enum_for_db!(PageLayout);

impl Default for PageLayout {
    fn default() -> Self {
        Self::Horizontal
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[graphql(input_name = "PageInput")]
#[table_name = "pages"]
pub struct Page {
    pub id: Uuid,
    pub document_id: Uuid,
    pub index: i32,
    pub title: String,
    pub layout: PageLayout,
    #[graphql(skip_input)]
    pub created_by_id: i32,
    #[graphql(skip_input)]
    pub deleted_at: Option<i64>,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl Page {
    pub fn upsert(conn: &PgConnection, mut page: Self) -> Result<Self, Error> {
        page.updated_at = get_now_as_secs();
        page.created_at = get_now_as_secs();
        diesel::insert_into(pages::table)
            .values(&page)
            .on_conflict(pages::id)
            .do_update()
            .set((
                pages::updated_at.eq(&page.updated_at),
                pages::title.eq(&page.title),
                pages::index.eq(&page.index),
                pages::layout.eq(&page.layout),
            ))
            .get_result(conn)
    }

    pub fn find_all_by_document_ids(
        conn: &PgConnection,
        document_ids: Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        pages::table
            .filter(pages::document_id.eq_any(document_ids))
            .filter(pages::deleted_at.is_null())
            .get_results(conn)
    }

    pub fn soft_delete(conn: &PgConnection, id: Uuid) -> Result<(), Error> {
        diesel::update(pages::table.find(id))
            .set(pages::deleted_at.eq(get_now_as_secs()))
            .execute(conn)?;

        Ok(())
    }

    pub fn restore(conn: &PgConnection, id: Uuid) -> Result<Self, Error> {
        diesel::update(pages::table.find(id))
            .set(pages::deleted_at.eq(None::<i64>))
            .get_result(conn)
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[graphql(input_name = "PageContentInput")]
#[table_name = "page_contents"]
pub struct PageContent {
    pub id: Uuid,
    pub page_id: Uuid,
    pub index: i32,
    pub body: String,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl PageContent {
    pub fn upsert(conn: &PgConnection, mut page_content: Self) -> Result<Self, Error> {
        page_content.updated_at = get_now_as_secs();
        page_content.created_at = get_now_as_secs();

        diesel::insert_into(page_contents::table)
            .values(&page_content)
            .on_conflict(page_contents::id)
            .do_update()
            .set((
                page_contents::index.eq(&page_content.index),
                page_contents::body.eq(&page_content.body),
                page_contents::updated_at.eq(&page_content.updated_at),
            ))
            .get_result(conn)
    }

    pub fn find_all_by_pages(conn: &PgConnection, page_ids: Vec<Uuid>) -> Result<Vec<Self>, Error> {
        page_contents::table
            .filter(page_contents::page_id.eq_any(page_ids))
            .get_results(conn)
    }
}
