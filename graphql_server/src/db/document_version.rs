use diesel::result::Error;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::document_versions;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[table_name = "document_versions"]
#[graphql(input_name = "DocumentVersionInput", complex)]
pub struct DocumentVersion {
    pub id: Uuid,
    #[graphql(skip_input)]
    pub root_document_id: Uuid,
    #[graphql(skip_input)]
    pub versioning_document_id: Uuid,
    pub name: String,
    #[graphql(skip_input)]
    pub creator_id: Option<i32>,
    #[graphql(skip_input)]
    pub is_auto: bool,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl DocumentVersion {
    pub fn new(
        name: String,
        root_document_id: Uuid,
        versioning_document_id: Uuid,
        creator_id: Option<i32>,
        is_auto: bool,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            root_document_id,
            versioning_document_id,
            creator_id,
            is_auto,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
        }
    }

    pub fn quick_new(
        name: String,
        root_document_id: Uuid,
        versioning_document_id: Uuid,
        creator_id: Option<i32>,
    ) -> Self {
        Self::new(
            name,
            root_document_id,
            versioning_document_id,
            creator_id,
            false,
        )
    }

    pub fn find(conn: &PgConnection, id: Uuid) -> Result<Self, Error> {
        document_versions::table.find(id).first(conn)
    }

    pub fn upsert(conn: &PgConnection, mut item: Self) -> Result<Self, Error> {
        let now = get_now_as_secs();
        item.updated_at = now;
        item.created_at = now;
        diesel::insert_into(document_versions::table)
            .values(&item)
            .on_conflict(document_versions::id)
            .do_update()
            .set((
                document_versions::name.eq(&item.name),
                document_versions::updated_at.eq(&item.updated_at),
            ))
            .get_result(conn)
    }

    pub fn find_last_version_of_document(conn: &PgConnection, document_id: Uuid) -> Option<Self> {
        match document_versions::table
            .filter(document_versions::root_document_id.eq(document_id))
            .order_by(document_versions::created_at.desc())
            .first(conn)
        {
            Ok(item) => Some(item),
            _ => None,
        }
    }

    pub fn find_by_document_id(
        conn: &PgConnection,
        document_id: Uuid,
        created_from: Option<i64>,
    ) -> Result<Vec<Self>, Error> {
        let mut query = document_versions::table
            .filter(document_versions::root_document_id.eq(document_id))
            .into_boxed();

        if let Some(created_from) = created_from {
            query = query.filter(document_versions::created_at.gt(created_from));
        }

        query.get_results(conn)
    }
}
