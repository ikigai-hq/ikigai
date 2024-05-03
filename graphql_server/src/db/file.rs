use diesel::dsl::any;
use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{ExpressionMethods, PgConnection, PgTextExpressionMethods, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::files;
use crate::impl_enum_for_db;
use crate::service::Storage;
use crate::util::get_now_as_secs;

pub const FOLDER_MIME_TYPE: &str = "folder";

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[sql_type = "Integer"]
pub enum FileStatus {
    Pending,
    Failed,
    Success,
}

impl_enum_for_db!(FileStatus);

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject)]
#[table_name = "files"]
#[graphql(complex)]
pub struct File {
    pub uuid: Uuid,
    pub user_id: i32,
    pub status: FileStatus,
    pub public: bool,
    pub file_name: String,
    pub content_type: String,
    pub content_length: i64,
    pub updated_at: i64,
    pub created_at: i64,
    #[graphql(skip)]
    pub download_cached_url: Option<String>,
    #[graphql(skip)]
    pub download_url_expire_in: Option<i64>,
    pub waveform_audio_json_str: Option<String>,
}

impl File {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        user_id: i32,
        public: bool,
        file_name: String,
        content_type: String,
        content_length: i64,
    ) -> Self {
        Self {
            uuid: Uuid::new_v4(),
            user_id,
            status: FileStatus::Pending,
            public,
            file_name,
            content_type,
            content_length,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
            download_cached_url: None,
            download_url_expire_in: None,
            waveform_audio_json_str: None,
        }
    }


    pub fn key(&self) -> String {
        format!("user_{}/{}", self.user_id, self.uuid)
    }

    pub fn duplicate(mut self) -> Self {
        self.uuid = Uuid::new_v4();
        self.updated_at = get_now_as_secs();
        self.created_at = get_now_as_secs();
        self
    }

    pub fn batch_insert(conn: &PgConnection, files: Vec<File>) -> Result<Vec<Self>, Error> {
        if files.is_empty() {
            return Ok(vec![]);
        }

        diesel::insert_into(files::table)
            .values(files)
            .get_results(conn)
    }

    pub fn upsert(conn: &PgConnection, file: &File) -> Result<Self, Error> {
        diesel::insert_into(files::table)
            .values(file)
            .on_conflict(files::uuid)
            .do_update()
            .set((
                files::status.eq(file.status),
                files::content_length.eq(file.content_length),
                files::content_type.eq(&file.content_type),
                files::updated_at.eq(get_now_as_secs()),
            ))
            .get_result(conn)
    }

    pub fn update_waveform(
        conn: &PgConnection,
        file_id: Uuid,
        waveform_audio_json_str: &str,
    ) -> Result<(), Error> {
        diesel::update(files::table.find(file_id))
            .set((
                files::waveform_audio_json_str.eq(waveform_audio_json_str),
                files::updated_at.eq(get_now_as_secs()),
            ))
            .execute(conn)?;
        Ok(())
    }

    pub fn remove(conn: &PgConnection, id: Uuid) -> Result<(), Error> {
        diesel::delete(files::table.find(id)).execute(conn)?;
        Ok(())
    }

    pub fn remove_by_ids(conn: &PgConnection, file_ids: &[Uuid]) -> Result<(), Error> {
        diesel::delete(files::table.filter(files::uuid.eq_any(file_ids)))
            .execute(conn)
            .map(|_| ())
    }

    pub fn find_by_id(conn: &PgConnection, id: Uuid) -> Result<Self, Error> {
        files::table.find(id).first(conn)
    }

    #[allow(clippy::too_many_arguments)]
    pub fn find_all_by_user(
        conn: &PgConnection,
        user_id: i32,
        is_folder: bool,
        keyword: Option<String>,
        offset: i64,
        limit: i64,
    ) -> Result<(Vec<Self>, i64), Error> {
        let get_query = || {
            let mut query = files::table.filter(files::user_id.eq(user_id)).into_boxed();

            if let Some(keyword) = &keyword {
                query = query.filter(files::file_name.ilike(format!("%{}%", keyword)));
            }

            if is_folder {
                query = query.filter(files::content_type.eq(FOLDER_MIME_TYPE))
            } else {
                query = query.filter(files::content_type.ne(FOLDER_MIME_TYPE))
            }

            query
        };
        let items = get_query()
            .order_by(files::updated_at.desc())
            .offset(offset)
            .limit(limit)
            .load::<Self>(conn)?;
        let total = get_query().count().get_result(conn)?;

        Ok((items, total))
    }

    pub fn find_all_by_ids(conn: &PgConnection, file_ids: &[Uuid]) -> Result<Vec<File>, Error> {
        files::table
            .filter(files::uuid.eq(any(file_ids)))
            .load(conn)
    }

    pub fn get_public_url(&self) -> Option<String> {
        if self.public {
            let bucket_url = Storage::from_env_config().s3.bucket_url();
            Some(format!("{}/{}", bucket_url, self.key()))
        } else {
            None
        }
    }

    pub fn insert_download_url(
        conn: &PgConnection,
        file_id: Uuid,
        download_url: &str,
        expire_in_next: i64,
    ) -> Result<(), Error> {
        diesel::update(files::table.find(file_id))
            .set((
                files::download_cached_url.eq(download_url),
                files::download_url_expire_in.eq(get_now_as_secs() + expire_in_next),
            ))
            .execute(conn)?;
        Ok(())
    }
}
