use crate::db::{Assignment, NewAssignment};
use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{AsChangeset, Connection, ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::{document_assigned_users, documents};
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Copy, Eq, PartialEq, Enum)]
pub enum DocumentType {
    Folder,
    Assignment,
    Submission,
}

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[diesel(sql_type = Integer)]
pub enum IconType {
    Emoji,
    Image,
}

impl_enum_for_db!(IconType);

impl Default for IconType {
    fn default() -> Self {
        Self::Emoji
    }
}

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[diesel(sql_type = Integer)]
pub enum DocumentVisibility {
    Private,
    Public,
    Assignees,
}

impl_enum_for_db!(DocumentVisibility);

impl Default for DocumentVisibility {
    fn default() -> Self {
        Self::Private
    }
}

impl DocumentVisibility {
    pub fn get_name(&self) -> String {
        match self {
            DocumentVisibility::Private => "private",
            DocumentVisibility::Public => "public",
            DocumentVisibility::Assignees => "assignees",
        }
        .into()
    }
}

#[derive(Debug, Clone, AsChangeset, InputObject)]
#[diesel(table_name = documents, treat_none_as_null = true)]
pub struct UpdateDocumentData {
    pub title: String,
    pub cover_photo_id: Option<Uuid>,
    #[graphql(skip)]
    pub updated_at: i64,
    #[graphql(skip)]
    pub updated_by: Option<i32>,
    #[graphql(skip)]
    pub last_edited_content_at: i64,
    pub icon_type: Option<IconType>,
    pub icon_value: Option<String>,
    pub visibility: DocumentVisibility,
}

#[derive(Debug, Clone, AsChangeset, InputObject)]
#[diesel(table_name = documents, treat_none_as_null = true)]
pub struct UpdatePositionData {
    pub id: Uuid,
    pub parent_id: Option<Uuid>,
    pub index: i32,
    #[graphql(skip)]
    pub updated_at: i64,
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[graphql(complex, input_name = "NewDocument")]
pub struct Document {
    #[graphql(skip_input)]
    pub id: Uuid,
    #[graphql(skip_input)]
    pub creator_id: i32,
    pub parent_id: Option<Uuid>,
    pub cover_photo_id: Option<Uuid>,
    pub index: i32,
    pub title: String,
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
    pub icon_type: Option<IconType>,
    pub icon_value: Option<String>,
    #[graphql(skip_input)]
    pub visibility: DocumentVisibility,
}

impl Document {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        creator_id: i32,
        title: String,
        parent_id: Option<Uuid>,
        index: i32,
        cover_photo_id: Option<Uuid>,
        space_id: Option<i32>,
        icon_type: Option<IconType>,
        icon_value: Option<String>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            creator_id,
            title,
            parent_id,
            index,
            cover_photo_id,
            deleted_at: None,
            updated_by: None,
            last_edited_content_at: get_now_as_secs(),
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
            space_id,
            icon_type,
            icon_value,
            visibility: DocumentVisibility::Private,
        }
    }

    pub fn upsert(conn: &mut PgConnection, mut new_document: Self) -> Result<Self, Error> {
        new_document.updated_at = get_now_as_secs();
        new_document.created_at = get_now_as_secs();
        diesel::insert_into(documents::table)
            .values(new_document)
            .on_conflict(documents::id)
            .do_update()
            .set(documents::updated_at.eq(get_now_as_secs()))
            .get_result(conn)
    }

    pub fn get_or_create_starter_doc(
        conn: &mut PgConnection,
        user_id: i32,
        space_id: i32,
    ) -> Result<Self, Error> {
        if let Some(starter_doc) = Document::find_starter_of_space(conn, space_id)? {
            Ok(starter_doc)
        } else {
            conn.transaction::<_, Error, _>(|conn| {
                let first_assignment = Self::new(
                    user_id,
                    "First Assignment".into(),
                    None,
                    0,
                    None,
                    Some(space_id),
                    None,
                    None,
                );
                let first_assignment = Document::upsert(conn, first_assignment)?;
                let new_assignment = NewAssignment::init(first_assignment.id);
                Assignment::insert(conn, new_assignment)?;

                Ok(first_assignment)
            })
        }
    }

    pub fn update(
        conn: &mut PgConnection,
        id: Uuid,
        mut data: UpdateDocumentData,
    ) -> Result<Self, Error> {
        data.updated_at = get_now_as_secs();
        data.last_edited_content_at = get_now_as_secs();
        diesel::update(documents::table.find(id))
            .set(data)
            .get_result(conn)
    }

    pub fn update_space_id(
        conn: &mut PgConnection,
        id: Uuid,
        space_id: i32,
    ) -> Result<Self, Error> {
        diesel::update(documents::table.find(id))
            .set((
                documents::space_id.eq(space_id),
                documents::updated_at.eq(get_now_as_secs()),
            ))
            .get_result(conn)
    }

    pub fn update_positions(
        conn: &mut PgConnection,
        items: Vec<UpdatePositionData>,
    ) -> Result<Vec<Self>, Error> {
        conn.transaction::<_, Error, _>(|conn| {
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

    pub fn find_by_id(conn: &mut PgConnection, id: Uuid) -> Result<Self, Error> {
        documents::table.find(id).first(conn)
    }

    pub fn find_by_ids(conn: &mut PgConnection, ids: Vec<Uuid>) -> Result<Vec<Self>, Error> {
        documents::table
            .filter(documents::id.eq_any(ids))
            .get_results(conn)
    }

    pub fn find_by_parent(
        conn: &mut PgConnection,
        parent_id: Uuid,
    ) -> Result<Vec<Document>, Error> {
        documents::table
            .filter(documents::parent_id.eq(parent_id))
            .order_by(documents::index.asc())
            .get_results(conn)
    }

    pub fn find_all_by_space(
        conn: &mut PgConnection,
        space_id: i32,
    ) -> Result<Vec<Document>, Error> {
        documents::table
            .filter(documents::space_id.eq(space_id))
            .filter(documents::deleted_at.is_null())
            .get_results(conn)
    }

    pub fn find_starter_of_space(
        conn: &mut PgConnection,
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
        conn: &mut PgConnection,
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

    pub fn delete(conn: &mut PgConnection, id: Uuid) -> Result<(), Error> {
        diesel::delete(documents::table.find(id)).execute(conn)?;
        Ok(())
    }

    pub fn soft_delete(conn: &mut PgConnection, id: Uuid) -> Result<(), Error> {
        diesel::update(documents::table.find(id))
            .set(documents::deleted_at.eq(get_now_as_secs()))
            .execute(conn)?;
        Ok(())
    }

    pub fn soft_delete_by_ids(
        conn: &mut PgConnection,
        ids: Vec<Uuid>,
        deleted_at: Option<i64>,
    ) -> Result<(), Error> {
        #[derive(AsChangeset)]
        #[diesel(table_name = documents, treat_none_as_null = true)]
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

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[diesel(table_name = document_assigned_users)]
#[graphql(complex, input_name = "NewDocument")]
pub struct DocumentAssignedUsers {
    pub document_id: Uuid,
    pub assigned_user_id: i32,
    pub created_at: i64,
}

impl DocumentAssignedUsers {
    pub fn new(document_id: Uuid, assigned_user_id: i32) -> Self {
        Self {
            document_id,
            assigned_user_id,
            created_at: get_now_as_secs(),
        }
    }

    pub fn batch_upsert(
        conn: &mut PgConnection,
        assigned_users: Vec<Self>,
    ) -> Result<Vec<Self>, Error> {
        diesel::insert_into(document_assigned_users::table)
            .values(assigned_users)
            .on_conflict_do_nothing()
            .get_results(conn)
    }

    pub fn find_all_by_document(
        conn: &mut PgConnection,
        document_id: Uuid,
    ) -> Result<Vec<Self>, Error> {
        document_assigned_users::table
            .filter(document_assigned_users::document_id.eq(document_id))
            .get_results(conn)
    }

    pub fn remove(conn: &mut PgConnection, document_id: Uuid, user_id: i32) -> Result<(), Error> {
        diesel::delete(document_assigned_users::table.find((document_id, user_id)))
            .execute(conn)?;
        Ok(())
    }
}
