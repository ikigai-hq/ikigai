use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use std::collections::HashMap;
use uuid::Uuid;

use crate::db::ALL_QUIZ_TYPES;

use super::schema::{page_contents, pages};
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[diesel(sql_type = Integer)]
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
#[graphql(input_name = "PageInput", complex)]
#[diesel(table_name = pages)]
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
    pub fn upsert(conn: &mut PgConnection, mut page: Self) -> Result<Self, Error> {
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

    pub fn find(conn: &mut PgConnection, id: Uuid) -> Result<Self, Error> {
        pages::table.find(id).first(conn)
    }

    pub fn find_all_by_document_id(
        conn: &mut PgConnection,
        document_id: Uuid,
    ) -> Result<Vec<Self>, Error> {
        pages::table
            .filter(pages::document_id.eq(document_id))
            .filter(pages::deleted_at.is_null())
            .get_results(conn)
    }

    pub fn find_all_by_document_ids(
        conn: &mut PgConnection,
        document_ids: Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        pages::table
            .filter(pages::document_id.eq_any(document_ids))
            .filter(pages::deleted_at.is_null())
            .get_results(conn)
    }

    pub fn soft_delete(conn: &mut PgConnection, id: Uuid) -> Result<(), Error> {
        diesel::update(pages::table.find(id))
            .set(pages::deleted_at.eq(get_now_as_secs()))
            .execute(conn)?;

        Ok(())
    }

    pub fn restore(conn: &mut PgConnection, id: Uuid) -> Result<Self, Error> {
        diesel::update(pages::table.find(id))
            .set(pages::deleted_at.eq(None::<i64>))
            .get_result(conn)
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[graphql(input_name = "PageContentInput", complex)]
#[diesel(table_name = page_contents)]
pub struct PageContent {
    pub id: Uuid,
    pub page_id: Uuid,
    pub index: i32,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
    pub body: serde_json::Value,
}

impl PageContent {
    pub fn new(id: Uuid, page_id: Uuid, index: i32, body: serde_json::Value) -> Self {
        Self {
            id,
            page_id,
            index,
            body,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
        }
    }

    pub fn upsert(conn: &mut PgConnection, mut page_content: Self) -> Result<Self, Error> {
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

    pub fn find(conn: &mut PgConnection, id: Uuid) -> Result<Self, Error> {
        page_contents::table.find(id).first(conn)
    }

    pub fn find_all_by_page(conn: &mut PgConnection, page_id: Uuid) -> Result<Vec<Self>, Error> {
        page_contents::table
            .filter(page_contents::page_id.eq(page_id))
            .get_results(conn)
    }

    pub fn find_all_by_pages(
        conn: &mut PgConnection,
        page_ids: Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        page_contents::table
            .filter(page_contents::page_id.eq_any(page_ids))
            .get_results(conn)
    }

    pub fn get_json_content(&self) -> JSONContent {
        serde_json::from_value::<JSONContent>(self.body.clone()).unwrap_or_default()
    }
}

// This is the struct of tiptap JSON Content
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct JSONContent {
    #[serde(rename = "type")]
    pub content_type: Option<String>,
    pub attrs: Option<HashMap<String, serde_json::Value>>,
    pub content: Option<Vec<JSONContent>>,
    pub marks: Option<Vec<ContentMark>>,
    pub text: Option<String>,
    #[serde(flatten)]
    pub other_data: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentMark {
    #[serde(rename = "type")]
    pub content_type: String,
    pub attrs: Option<HashMap<String, serde_json::Value>>,
    #[serde(flatten)]
    pub keys: HashMap<String, serde_json::Value>,
}

impl JSONContent {
    pub fn find_blocks(&self, predicate: fn(&JSONContent) -> bool) -> Vec<&JSONContent> {
        let mut result: Vec<&JSONContent> = vec![];
        if predicate(self) {
            result.push(self);
        }

        if let Some(contents) = self.content.as_ref() {
            for content in contents {
                result.append(&mut content.find_blocks(predicate));
            }
        }

        result
    }

    pub fn replace_block_id(
        &mut self,
        block_name: &str,
        key_id: &str,
        old_id: &serde_json::Value,
        new_id: &serde_json::Value,
    ) {
        if self.content_type.as_deref() == Some(block_name) {
            let is_correct_block = self
                .attrs
                .as_ref()
                .map_or_else(|| false, |attrs| attrs.get(key_id) == Some(old_id));
            if is_correct_block {
                if let Some(attrs) = self.attrs.as_mut() {
                    attrs.insert(key_id.into(), new_id.clone());
                }
            }
        }

        if let Some(contents) = self.content.as_mut() {
            for content in contents {
                content.replace_block_id(block_name, key_id, old_id, new_id);
            }
        }
    }

    pub fn has_file_handler(&self, file_id: Uuid) -> bool {
        let file_value = serde_json::to_value(file_id).unwrap_or_default();
        let predicate =
            |content: &JSONContent| content.content_type.as_deref() == Some("fileHandler");
        let file_handlers = self.find_blocks(predicate);
        file_handlers.iter().any(|file_content| {
            file_content
                .attrs
                .as_ref()
                .map_or_else(|| false, |attrs| attrs.get("fileId") == Some(&file_value))
        })
    }

    pub fn find_quiz_blocks(&self) -> Vec<&JSONContent> {
        let predicate = |content: &JSONContent| {
            content.content_type.as_ref().map_or(false, |content_type| {
                ALL_QUIZ_TYPES
                    .iter()
                    .any(|quiz| quiz.block_name() == content_type.as_str())
            })
        };
        self.find_blocks(predicate)
    }
}
