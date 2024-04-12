use diesel::dsl::max;
use diesel::result::Error;
use diesel::{AsChangeset, ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use oso::PolarClass;
use uuid::Uuid;

use super::schema::{class_documents, classes, documents};
use crate::db::schema::class_members;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Insertable, InputObject)]
#[table_name = "classes"]
pub struct NewClass {
    pub name: String,
    #[graphql(skip)]
    pub updated_at: i64,
    #[graphql(skip)]
    pub created_at: i64,
    #[graphql(skip)]
    pub banner_id: Option<Uuid>,
    #[graphql(skip)]
    pub org_id: i32,
    #[graphql(skip)]
    pub creator_id: i32,
}

impl From<Class> for NewClass {
    fn from(class: Class) -> Self {
        Self {
            name: class.name,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
            org_id: class.org_id,
            banner_id: class.banner_id,
            creator_id: class.creator_id,
        }
    }
}

impl NewClass {
    pub fn update_time(&mut self) {
        self.updated_at = get_now_as_secs();
        self.created_at = get_now_as_secs();
    }
}

#[derive(Debug, Clone, AsChangeset, InputObject)]
#[table_name = "classes"]
#[changeset_options(treat_none_as_null = "true")]
pub struct UpdateClassData {
    pub name: String,
    pub banner_id: Option<Uuid>,
    #[graphql(skip)]
    pub updated_at: i64,
}

#[derive(Debug, Clone, Queryable, SimpleObject, PolarClass)]
#[graphql(complex)]
pub struct Class {
    pub id: i32,
    pub name: String,
    pub updated_at: i64,
    pub created_at: i64,
    #[polar(attribute)]
    pub org_id: i32,
    pub banner_id: Option<Uuid>,
    pub creator_id: i32,
    pub deleted_at: Option<i64>,
}

impl Class {
    pub fn insert(conn: &PgConnection, mut new_class: NewClass) -> Result<Self, Error> {
        new_class.update_time();
        diesel::insert_into(classes::table)
            .values(new_class)
            .get_result(conn)
    }

    pub fn update(
        conn: &PgConnection,
        class_id: i32,
        mut data: UpdateClassData,
    ) -> Result<Self, Error> {
        data.updated_at = get_now_as_secs();
        diesel::update(classes::table.find(class_id))
            .set(data)
            .get_result(conn)
    }

    pub fn find_by_id(conn: &PgConnection, class_id: i32) -> Result<Self, Error> {
        classes::table.find(class_id).first(conn)
    }

    pub fn find_all_by_ids(conn: &PgConnection, class_ids: Vec<i32>) -> Result<Vec<Self>, Error> {
        classes::table
            .filter(classes::id.eq_any(class_ids))
            .get_results(conn)
    }

    pub fn find_all_deleted_classes(conn: &PgConnection, org_id: i32) -> Result<Vec<Self>, Error> {
        let sixty_days_ago = get_now_as_secs() - 5_184_000;
        classes::table
            .filter(classes::org_id.eq(org_id))
            .filter(classes::deleted_at.gt(sixty_days_ago))
            .get_results(conn)
    }

    pub fn find_all_org_classes(conn: &PgConnection, org_id: i32) -> Result<Vec<Self>, Error> {
        classes::table
            .filter(classes::org_id.eq(org_id))
            .filter(classes::deleted_at.is_null())
            .order_by(classes::name.asc())
            .get_results(conn)
    }

    pub fn find_my_classes(
        conn: &PgConnection,
        org_id: i32,
        user_id: i32,
    ) -> Result<Vec<Self>, Error> {
        classes::table
            .inner_join(class_members::table)
            .select(classes::all_columns)
            .filter(class_members::user_id.eq(user_id))
            .filter(classes::org_id.eq(org_id))
            .order_by(classes::created_at.desc())
            .get_results(conn)
    }

    pub fn find_all_by_owner(conn: &PgConnection, user_id: i32) -> Result<Vec<Self>, Error> {
        classes::table
            .filter(classes::creator_id.eq(user_id))
            .get_results(conn)
    }

    pub fn soft_remove(conn: &PgConnection, class_id: i32) -> Result<(), Error> {
        diesel::update(classes::table.find(class_id))
            .set((
                classes::deleted_at.eq(get_now_as_secs()),
                classes::updated_at.eq(get_now_as_secs()),
            ))
            .execute(conn)?;
        Ok(())
    }

    pub fn restore(conn: &PgConnection, class_id: i32) -> Result<Self, Error> {
        let item = diesel::update(classes::table.find(class_id))
            .set((
                classes::deleted_at.eq(None::<i64>),
                classes::updated_at.eq(get_now_as_secs()),
            ))
            .get_result(conn)?;
        Ok(item)
    }

    pub fn remove(conn: &PgConnection, class_id: i32) -> Result<(), Error> {
        diesel::delete(classes::table.find(class_id)).execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[table_name = "class_documents"]
#[graphql(complex, input_name = "ClassDocumentInput")]
pub struct ClassDocument {
    pub class_id: i32,
    pub document_id: Uuid,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl ClassDocument {
    pub fn new(class_id: i32, document_id: Uuid) -> Self {
        Self {
            class_id,
            document_id,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
        }
    }

    pub fn get_last_index(
        conn: &PgConnection,
        class_id: i32,
        parent_id: Option<Uuid>,
    ) -> Result<i32, Error> {
        let document_ids: Vec<Uuid> = class_documents::table
            .filter(class_documents::class_id.eq(class_id))
            .select(class_documents::document_id)
            .get_results(conn)?;
        let last_index = documents::table
            .filter(documents::id.eq_any(document_ids))
            .filter(documents::parent_id.eq(parent_id))
            .select(max(documents::index))
            .first::<Option<i32>>(conn)?
            .unwrap_or(0)
            + 1;

        Ok(last_index)
    }

    pub fn upsert(conn: &PgConnection, class_document: Self) -> Result<Self, Error> {
        diesel::insert_into(class_documents::table)
            .values(class_document)
            .on_conflict((class_documents::class_id, class_documents::document_id))
            .do_update()
            .set(class_documents::updated_at.eq(get_now_as_secs()))
            .get_result(conn)
    }

    pub fn find_by_id(
        conn: &PgConnection,
        class_id: i32,
        document_id: Uuid,
    ) -> Result<Self, Error> {
        class_documents::table
            .find((class_id, document_id))
            .first(conn)
    }

    pub fn find_by_document_id(conn: &PgConnection, document_id: Uuid) -> Result<Self, Error> {
        class_documents::table
            .filter(class_documents::document_id.eq(document_id))
            .first(conn)
    }

    pub fn find_by_document_id_opt(
        conn: &PgConnection,
        document_id: Uuid,
    ) -> Result<Option<Self>, Error> {
        match Self::find_by_document_id(conn, document_id) {
            Ok(i) => Ok(Some(i)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn find_all_by_document_ids(
        conn: &PgConnection,
        document_ids: Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        class_documents::table
            .filter(class_documents::document_id.eq_any(document_ids))
            .get_results(conn)
    }

    pub fn find_all_by_class_ids(
        conn: &PgConnection,
        class_ids: &Vec<i32>,
    ) -> Result<Vec<Self>, Error> {
        class_documents::table
            .filter(class_documents::class_id.eq_any(class_ids))
            .load(conn)
    }

    pub fn find_starter_by_class(
        conn: &PgConnection,
        class_id: i32,
    ) -> Result<Option<Self>, Error> {
        match class_documents::table
            .select(class_documents::all_columns)
            .inner_join(documents::table)
            .filter(class_documents::class_id.eq(class_id))
            .filter(documents::parent_id.is_null())
            .order_by(documents::index.asc())
            .first(conn)
        {
            Ok(item) => Ok(Some(item)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn find_all_by_class(conn: &PgConnection, class_id: i32) -> Result<Vec<Self>, Error> {
        class_documents::table
            .select(class_documents::all_columns)
            .inner_join(documents::table)
            .filter(class_documents::class_id.eq(class_id))
            .filter(documents::deleted_at.is_null())
            .get_results(conn)
    }
}
