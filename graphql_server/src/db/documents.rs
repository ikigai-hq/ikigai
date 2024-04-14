use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{AsChangeset, Connection, ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use oso::PolarClass;
use uuid::Uuid;

use super::schema::{document_highlights, documents};
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[sql_type = "Integer"]
pub enum HideRule {
    Public = 0,
    Private = 1,
}

impl_enum_for_db!(HideRule);

impl Default for HideRule {
    fn default() -> Self {
        Self::Public
    }
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Enum)]
pub enum DocumentType {
    Normal,
    Assignment,
}

#[derive(Debug, Clone, AsChangeset, InputObject)]
#[table_name = "documents"]
#[changeset_options(treat_none_as_null = "true")]
pub struct UpdateDocumentData {
    pub title: String,
    pub body: String,
    pub cover_photo_id: Option<Uuid>,
    pub editor_config: serde_json::Value,
    #[graphql(skip)]
    pub updated_at: i64,
    #[graphql(skip)]
    pub updated_by: Option<i32>,
    #[graphql(skip)]
    pub last_edited_content_at: i64,
}

#[derive(Debug, Clone, AsChangeset, InputObject)]
#[table_name = "documents"]
#[changeset_options(treat_none_as_null = "true")]
pub struct UpdatePositionData {
    pub id: Uuid,
    pub parent_id: Option<Uuid>,
    pub index: i32,
    #[graphql(skip)]
    pub updated_at: i64,
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject, PolarClass)]
#[graphql(complex, input_name = "NewDocument")]
pub struct Document {
    #[polar(attribute)]
    #[graphql(skip_input)]
    pub id: Uuid,
    #[polar(attribute)]
    #[graphql(skip_input)]
    pub creator_id: i32,
    #[polar(attribute)]
    #[graphql(skip_input)]
    pub org_id: i32,
    pub parent_id: Option<Uuid>,
    pub cover_photo_id: Option<Uuid>,
    pub index: i32,
    pub title: String,
    pub body: String,
    #[graphql(skip_input)]
    pub is_public: bool,
    #[graphql(skip_input)]
    pub hide_rule: HideRule,
    pub editor_config: serde_json::Value,
    #[graphql(skip_input)]
    pub deleted_at: Option<i64>,
    #[graphql(skip)]
    pub updated_by: Option<i32>,
    #[graphql(skip_input)]
    pub last_edited_content_at: i64,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
    pub space_id: Option<i32>,
}

impl Document {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        creator_id: i32,
        body: String,
        title: String,
        org_id: i32,
        parent_id: Option<Uuid>,
        index: i32,
        cover_photo_id: Option<Uuid>,
        hide_rule: HideRule,
        editor_config: serde_json::Value,
        space_id: Option<i32>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            creator_id,
            body,
            title,
            org_id,
            parent_id,
            index,
            cover_photo_id,
            hide_rule,
            editor_config,
            deleted_at: None,
            updated_by: None,
            last_edited_content_at: get_now_as_secs(),
            updated_at: get_now_as_secs(),
            is_public: false,
            created_at: get_now_as_secs(),
            space_id,
        }
    }

    pub fn upsert(conn: &PgConnection, mut new_document: Self) -> Result<Self, Error> {
        new_document.updated_at = get_now_as_secs();
        new_document.created_at = get_now_as_secs();
        diesel::insert_into(documents::table)
            .values(new_document)
            .on_conflict(documents::id)
            .do_update()
            .set(documents::updated_at.eq(get_now_as_secs()))
            .get_result(conn)
    }

    pub fn update(
        conn: &PgConnection,
        id: Uuid,
        mut data: UpdateDocumentData,
    ) -> Result<Self, Error> {
        data.updated_at = get_now_as_secs();
        data.last_edited_content_at = get_now_as_secs();
        diesel::update(documents::table.find(id))
            .set(data)
            .get_result(conn)
    }

    pub fn update_space_id(conn: &PgConnection, id: Uuid, space_id: i32) -> Result<Self, Error> {
        diesel::update(documents::table.find(id))
            .set((
                documents::space_id.eq(space_id),
                documents::updated_at.eq(get_now_as_secs()),
            ))
            .get_result(conn)
    }

    pub fn update_positions(
        conn: &PgConnection,
        items: Vec<UpdatePositionData>,
    ) -> Result<Vec<Self>, Error> {
        conn.transaction::<_, Error, _>(|| {
            let mut result: Vec<Self> = vec![];
            for item in items {
                result.push(
                    diesel::update(documents::table.find(item.id))
                        .set(item)
                        .get_result(conn)?,
                );
            }
            Ok(result)
        })
    }

    pub fn update_public(conn: &PgConnection, id: Uuid, is_public: bool) -> Result<Self, Error> {
        diesel::update(documents::table.find(id))
            .set((
                documents::is_public.eq(is_public),
                documents::updated_at.eq(get_now_as_secs()),
            ))
            .get_result(conn)
    }

    pub fn update_hide_rule(
        conn: &PgConnection,
        id: Uuid,
        hide_rule: HideRule,
    ) -> Result<Self, Error> {
        diesel::update(documents::table.find(id))
            .set((
                documents::hide_rule.eq(hide_rule),
                documents::updated_at.eq(get_now_as_secs()),
            ))
            .get_result(conn)
    }

    pub fn find_by_id(conn: &PgConnection, id: Uuid) -> Result<Self, Error> {
        documents::table.find(id).first(conn)
    }

    pub fn find_by_ids(conn: &PgConnection, ids: Vec<Uuid>) -> Result<Vec<Self>, Error> {
        documents::table
            .filter(documents::id.eq_any(ids))
            .get_results(conn)
    }

    pub fn find_by_parent(conn: &PgConnection, parent_id: Uuid) -> Result<Vec<Document>, Error> {
        documents::table
            .filter(documents::parent_id.eq(parent_id))
            .order_by(documents::index.asc())
            .get_results(conn)
    }

    pub fn find_all_by_space(conn: &PgConnection, space_id: i32) -> Result<Vec<Document>, Error> {
        documents::table
            .filter(documents::space_id.eq(space_id))
            .filter(documents::deleted_at.is_null())
            .get_results(conn)
    }

    pub fn find_starter_of_space(
        conn: &PgConnection,
        space_id: i32,
    ) -> Result<Option<Document>, Error> {
        match documents::table
            .filter(documents::space_id.eq(space_id))
            .filter(documents::parent_id.is_null())
            .order_by(documents::index.asc())
            .first(conn)
        {
            Ok(document) => Ok(Some(document)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn find_last_index(
        conn: &PgConnection,
        space_id: i32,
        parent_id: Option<Uuid>,
    ) -> Result<i32, Error> {
        let mut query = documents::table.into_boxed();
        query = query.filter(documents::space_id.eq(space_id));

        if let Some(parent_id) = parent_id {
            query = query.filter(documents::parent_id.eq(parent_id));
        } else {
            query = query.filter(documents::parent_id.is_null());
        };

        match query.order_by(documents::index.desc()).first::<Self>(conn) {
            Ok(document) => Ok(document.index + 1),
            Err(Error::NotFound) => Ok(1),
            Err(e) => Err(e),
        }
    }

    pub fn find_deleted_documents(conn: &PgConnection, org_id: i32) -> Result<Vec<Self>, Error> {
        let sixty_days_ago = get_now_as_secs() - 5_184_000;
        documents::table
            .filter(documents::deleted_at.gt(sixty_days_ago))
            .filter(documents::org_id.eq(org_id))
            .get_results(conn)
    }

    pub fn delete(conn: &PgConnection, id: Uuid) -> Result<(), Error> {
        diesel::delete(documents::table.find(id)).execute(conn)?;
        Ok(())
    }

    pub fn soft_delete(conn: &PgConnection, id: Uuid) -> Result<(), Error> {
        diesel::update(documents::table.find(id))
            .set(documents::deleted_at.eq(get_now_as_secs()))
            .execute(conn)?;
        Ok(())
    }

    pub fn soft_delete_by_ids(
        conn: &PgConnection,
        ids: Vec<Uuid>,
        deleted_at: Option<i64>,
    ) -> Result<(), Error> {
        #[derive(AsChangeset)]
        #[changeset_options(treat_none_as_null = "true")]
        #[table_name = "documents"]
        pub struct DeletedAt {
            deleted_at: Option<i64>,
        }
        let deleted_at = DeletedAt { deleted_at };
        diesel::update(documents::table.filter(documents::id.eq_any(ids)))
            .set(deleted_at)
            .execute(conn)?;
        Ok(())
    }
}

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[sql_type = "Integer"]
pub enum HighlightType {
    Normal,
    Replace,
}

impl_enum_for_db!(HighlightType);

impl Default for HighlightType {
    fn default() -> Self {
        Self::Normal
    }
}

#[derive(Debug, Clone, InputObject, Insertable)]
#[table_name = "document_highlights"]
pub struct NewDocumentHighlight {
    pub document_id: Uuid,
    #[graphql(skip)]
    pub creator_id: i32,
    #[graphql(skip)]
    pub thread_id: i32,
    pub from_pos: i32,
    pub to_pos: i32,
    pub uuid: Uuid,
    pub highlight_type: HighlightType,
    pub original_text: String,
}

#[derive(Debug, Clone, SimpleObject, Queryable)]
#[graphql(complex)]
pub struct DocumentHighlight {
    pub document_id: Uuid,
    pub creator_id: i32,
    pub thread_id: i32,
    pub from_pos: i32,
    pub to_pos: i32,
    pub updated_at: i64,
    pub created_at: i64,
    pub uuid: Uuid,
    pub highlight_type: HighlightType,
    pub original_text: String,
}

impl DocumentHighlight {
    pub fn insert(conn: &PgConnection, new_highlight: NewDocumentHighlight) -> Result<Self, Error> {
        diesel::insert_into(document_highlights::table)
            .values(new_highlight)
            .on_conflict(document_highlights::uuid)
            .do_update()
            .set(document_highlights::updated_at.eq(get_now_as_secs()))
            .get_result(conn)
    }

    pub fn remove(conn: &PgConnection, id: Uuid) -> Result<(), Error> {
        diesel::delete(document_highlights::table.find(id)).execute(conn)?;
        Ok(())
    }

    pub fn find_by_id(conn: &PgConnection, id: Uuid) -> Result<Self, Error> {
        document_highlights::table.find(id).first(conn)
    }

    pub fn find_all_by_document(
        conn: &PgConnection,
        document_id: Uuid,
    ) -> Result<Vec<Self>, Error> {
        document_highlights::table
            .filter(document_highlights::document_id.eq(document_id))
            .get_results(conn)
    }
}
