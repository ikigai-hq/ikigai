use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::{document_page_block_nested_documents, document_page_blocks};
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[sql_type = "Integer"]
pub enum PageViewMode {
    Split,
    Single,
}

impl_enum_for_db!(PageViewMode);

#[derive(Debug, Clone, SimpleObject, InputObject, Insertable, Queryable)]
#[table_name = "document_page_blocks"]
#[graphql(input_name = "PageBlockInput", complex)]
pub struct PageBlock {
    pub id: Uuid,
    pub document_id: Uuid,
    pub title: String,
    pub view_mode: PageViewMode,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl PageBlock {
    pub fn upsert(conn: &PgConnection, mut page_block: Self) -> Result<Self, Error> {
        page_block.updated_at = get_now_as_secs();
        page_block.created_at = get_now_as_secs();

        diesel::insert_into(document_page_blocks::table)
            .values(&page_block)
            .on_conflict(document_page_blocks::id)
            .do_update()
            .set((
                document_page_blocks::title.eq(&page_block.title),
                document_page_blocks::view_mode.eq(&page_block.view_mode),
                document_page_blocks::updated_at.eq(&page_block.updated_at),
            ))
            .execute(conn)?;

        Ok(page_block)
    }

    pub fn find(conn: &PgConnection, page_block_id: Uuid) -> Result<Self, Error> {
        document_page_blocks::table.find(page_block_id).first(conn)
    }

    pub fn find_all_by_document(
        conn: &PgConnection,
        document_id: Uuid,
    ) -> Result<Vec<Self>, Error> {
        document_page_blocks::table
            .filter(document_page_blocks::document_id.eq(document_id))
            .get_results(conn)
    }

    pub fn delete_by_document(conn: &PgConnection, document_id: Uuid) -> Result<(), Error> {
        diesel::delete(
            document_page_blocks::table.filter(document_page_blocks::document_id.eq(document_id)),
        )
        .execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, SimpleObject, InputObject, Insertable, Queryable)]
#[table_name = "document_page_block_nested_documents"]
#[graphql(input_name = "PageBlockDocumentInput", complex)]
pub struct PageBlockDocument {
    pub page_block_id: Uuid,
    pub document_id: Uuid,
    pub index: i32,
    pub created_at: i64,
}

impl PageBlockDocument {
    pub fn new(page_block_id: Uuid, document_id: Uuid, index: i32) -> Self {
        Self {
            page_block_id,
            document_id,
            index,
            created_at: get_now_as_secs(),
        }
    }

    pub fn upsert(conn: &PgConnection, mut item: Self) -> Result<Self, Error> {
        item.created_at = get_now_as_secs();
        diesel::insert_into(document_page_block_nested_documents::table)
            .values(&item)
            .on_conflict((
                document_page_block_nested_documents::page_block_id,
                document_page_block_nested_documents::document_id,
            ))
            .do_update()
            .set(document_page_block_nested_documents::index.eq(&item.index))
            .execute(conn)?;

        Ok(item)
    }

    pub fn find_all_by_page_block(
        conn: &PgConnection,
        page_block_id: Uuid,
    ) -> Result<Vec<Self>, Error> {
        document_page_block_nested_documents::table
            .filter(document_page_block_nested_documents::page_block_id.eq(page_block_id))
            .get_results(conn)
    }

    pub fn find_all_by_page_blocks(
        conn: &PgConnection,
        page_block_ids: Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        document_page_block_nested_documents::table
            .filter(document_page_block_nested_documents::page_block_id.eq_any(page_block_ids))
            .get_results(conn)
    }
}
