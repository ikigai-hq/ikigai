use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::{
    document_template_and_tag, document_template_categories, document_template_category_tags,
    document_templates, tags,
};
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[sql_type = "Integer"]
pub enum TagUseCase {
    DocumentTemplateCategory,
}

impl_enum_for_db!(TagUseCase);

#[derive(Debug, Clone, SimpleObject, InputObject, Insertable, Queryable)]
#[table_name = "tags"]
#[graphql(input_name = "TagInput")]
pub struct Tag {
    pub name: String,
    #[graphql(skip_input)]
    pub org_id: i32,
    pub use_case: TagUseCase,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl Tag {
    pub fn new(name: String, org_id: i32) -> Self {
        Self {
            name,
            org_id,
            use_case: TagUseCase::DocumentTemplateCategory,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
        }
    }

    pub fn upsert(conn: &PgConnection, mut item: Self) -> Result<Self, Error> {
        item.updated_at = get_now_as_secs();
        item.created_at = get_now_as_secs();
        diesel::insert_into(tags::table)
            .values(&item)
            .on_conflict_do_nothing()
            .execute(conn)?;

        Ok(item)
    }

    pub fn find_org_tags_by_use_case(
        conn: &PgConnection,
        org_id: i32,
        use_case: TagUseCase,
    ) -> Result<Vec<Self>, Error> {
        tags::table
            .filter(tags::org_id.eq(org_id))
            .filter(tags::use_case.eq(use_case))
            .get_results(conn)
    }
}

#[derive(Debug, Clone, SimpleObject, InputObject, Insertable, Queryable)]
#[table_name = "document_template_categories"]
#[graphql(input_name = "CategoryInput", complex)]
pub struct Category {
    pub id: Uuid,
    pub name: String,
    #[graphql(skip_input)]
    pub org_id: i32,
    pub org_internal_index: Option<i32>,
    #[graphql(skip_input)]
    pub is_community: bool,
    #[graphql(skip_input)]
    pub community_index: Option<i32>,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl Category {
    pub fn new(name: String, org_id: i32, org_internal_index: i32) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            org_id,
            org_internal_index: Some(org_internal_index),
            is_community: false,
            community_index: None,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
        }
    }

    pub fn upsert(conn: &PgConnection, mut category: Self) -> Result<Self, Error> {
        category.updated_at = get_now_as_secs();
        category.created_at = get_now_as_secs();
        diesel::insert_into(document_template_categories::table)
            .values(&category)
            .on_conflict(document_template_categories::id)
            .do_update()
            .set((
                document_template_categories::name.eq(&category.name),
                document_template_categories::org_internal_index.eq(&category.org_internal_index),
                document_template_categories::updated_at.eq(&category.updated_at),
            ))
            .get_result(conn)
    }

    pub fn find_last_org_internal_index(conn: &PgConnection, org_id: i32) -> i32 {
        match document_template_categories::table
            .filter(document_template_categories::org_id.eq(org_id))
            .order_by(document_template_categories::org_internal_index.desc())
            .first::<Self>(conn)
        {
            Ok(item) => item.org_internal_index.unwrap_or(0) + 1,
            _ => 1,
        }
    }

    pub fn find(conn: &PgConnection, id: Uuid) -> Result<Self, Error> {
        document_template_categories::table.find(id).first(conn)
    }

    pub fn find_org_categories(conn: &PgConnection, org_id: i32) -> Result<Vec<Self>, Error> {
        document_template_categories::table
            .filter(document_template_categories::org_id.eq(org_id))
            .order_by(document_template_categories::created_at.desc())
            .get_results(conn)
    }

    pub fn find_community_categories(conn: &PgConnection) -> Result<Vec<Self>, Error> {
        document_template_categories::table
            .filter(document_template_categories::is_community.eq(true))
            .order_by(document_template_categories::community_index.asc())
            .get_results(conn)
    }

    pub fn delete(conn: &PgConnection, id: Uuid) -> Result<(), Error> {
        diesel::delete(document_template_categories::table.find(id)).execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, SimpleObject, InputObject, Insertable, Queryable)]
#[table_name = "document_template_category_tags"]
#[graphql(input_name = "CategoryTagInput")]
pub struct CategoryTag {
    pub category_id: Uuid,
    pub tag: String,
}

impl CategoryTag {
    pub fn insert(conn: &PgConnection, item: Self) -> Result<Self, Error> {
        diesel::insert_into(document_template_category_tags::table)
            .values(&item)
            .on_conflict_do_nothing()
            .execute(conn)?;
        Ok(item)
    }

    pub fn find_by_ids(conn: &PgConnection, category_ids: Vec<Uuid>) -> Result<Vec<Self>, Error> {
        document_template_category_tags::table
            .filter(document_template_category_tags::category_id.eq_any(category_ids))
            .get_results(conn)
    }

    pub fn delete(conn: &PgConnection, item: Self) -> Result<(), Error> {
        diesel::delete(document_template_category_tags::table.find((item.category_id, item.tag)))
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, SimpleObject, InputObject, Insertable, Queryable)]
#[table_name = "document_templates"]
#[graphql(input_name = "DocumentTemplateInput", complex)]
pub struct DocumentTemplate {
    pub id: Uuid,
    pub name: String,
    #[graphql(skip_input)]
    pub document_id: Uuid,
    #[graphql(skip_input)]
    pub org_id: i32,
    #[graphql(skip_input)]
    pub created_by: Option<i32>,
    #[graphql(skip_input)]
    pub is_published: bool,
    #[graphql(skip)]
    pub updated_at: i64,
    #[graphql(skip)]
    pub created_at: i64,
}

impl DocumentTemplate {
    pub fn new(name: String, document_id: Uuid, org_id: i32, created_by: i32) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            document_id,
            org_id,
            created_by: Some(created_by),
            is_published: false,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
        }
    }

    pub fn upsert(conn: &PgConnection, mut template: Self) -> Result<Self, Error> {
        template.updated_at = get_now_as_secs();
        template.created_at = get_now_as_secs();
        diesel::insert_into(document_templates::table)
            .values(&template)
            .on_conflict(document_templates::id)
            .do_update()
            .set((
                document_templates::name.eq(&template.name),
                document_templates::updated_at.eq(&template.updated_at),
            ))
            .get_result(conn)
    }

    pub fn find(conn: &PgConnection, id: Uuid) -> Result<Self, Error> {
        document_templates::table.find(id).first(conn)
    }

    pub fn is_published_template(conn: &PgConnection, document_id: Uuid) -> bool {
        document_templates::table
            .filter(document_templates::document_id.eq(document_id))
            .filter(document_templates::is_published.eq(true))
            .first::<Self>(conn)
            .is_ok()
    }

    pub fn find_org_templates(conn: &PgConnection, org_id: i32) -> Result<Vec<Self>, Error> {
        document_templates::table
            .filter(document_templates::org_id.eq(org_id))
            .order_by(document_templates::created_at.desc())
            .get_results(conn)
    }

    pub fn find_published_templates(conn: &PgConnection) -> Result<Vec<Self>, Error> {
        document_templates::table
            .filter(document_templates::is_published.eq(true))
            .order_by(document_templates::created_at.desc())
            .get_results(conn)
    }

    pub fn delete(conn: &PgConnection, template_id: Uuid) -> Result<(), Error> {
        diesel::delete(document_templates::table.find(template_id)).execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, SimpleObject, InputObject, Insertable, Queryable)]
#[table_name = "document_template_and_tag"]
#[graphql(input_name = "DocumentTemplateTagInput")]
pub struct DocumentTemplateTag {
    pub document_template_id: Uuid,
    pub tag: String,
}

impl DocumentTemplateTag {
    pub fn upsert(conn: &PgConnection, item: Self) -> Result<Self, Error> {
        diesel::insert_into(document_template_and_tag::table)
            .values(&item)
            .on_conflict_do_nothing()
            .execute(conn)?;
        Ok(item)
    }

    pub fn find_by_templates(
        conn: &PgConnection,
        template_ids: Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        document_template_and_tag::table
            .filter(document_template_and_tag::document_template_id.eq_any(template_ids))
            .get_results(conn)
    }

    pub fn delete(conn: &PgConnection, item: Self) -> Result<(), Error> {
        diesel::delete(
            document_template_and_tag::table.find((item.document_template_id, item.tag)),
        )
        .execute(conn)?;
        Ok(())
    }
}
