use crate::authorization::UserAuth;
use async_graphql::*;
use uuid::Uuid;

use crate::background_job::storage_job::add_generate_waveform_job;
use crate::db::file::{File, FileStatus};
use crate::db::Connection;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::{
    get_conn_from_ctx, get_user_auth_from_ctx, get_user_from_ctx, is_owner_of_file,
};
use crate::service::{Storage, UploadInfo};

#[derive(Clone, InputObject)]
pub struct CreateFileData {
    file_name: String,
    content_type: String,
    content_length: i64,
    public: bool,
}

#[derive(Clone, SimpleObject)]
pub struct CreateFileResponse {
    file: File,
    upload_info: UploadInfo,
}

#[derive(Default)]
pub struct FileMutation;

#[Object]
impl FileMutation {
    async fn file_create(
        &self,
        ctx: &Context<'_>,
        data: CreateFileData,
    ) -> Result<CreateFileResponse> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;

        create_file_upload(conn, &user_auth, data).await
    }

    async fn file_create_recording(
        &self,
        ctx: &Context<'_>,
        data: CreateFileData,
    ) -> Result<CreateFileResponse> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        create_file_upload(conn, &user_auth, data).await
    }

    async fn file_create_multiple(
        &self,
        ctx: &Context<'_>,
        data: Vec<CreateFileData>,
    ) -> Result<Vec<CreateFileResponse>> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let user_id = user_auth.id;
        let files = data
            .into_iter()
            .map(|d| {
                File::new(
                    user_id,
                    d.public,
                    d.file_name,
                    d.content_type,
                    d.content_length,
                )
            })
            .collect();
        let files = File::batch_insert(&conn, files).format_err()?;
        let mut result = vec![];
        for file in files {
            let upload_info = Storage::from_env_config().generate_upload_info(
                file.key(),
                &file.content_type,
                file.content_length,
                file.public,
            )?;
            result.push(CreateFileResponse { file, upload_info })
        }

        Ok(result)
    }

    async fn file_check(&self, ctx: &Context<'_>, file_id: Uuid) -> Result<bool> {
        let user = get_user_from_ctx(ctx).await?;
        is_owner_of_file(ctx, user.id, file_id).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let mut file = File::find_by_id(&conn, file_id).format_err()?;
        if let Some(file_info) = Storage::from_env_config().get_file_info(file.key()).await? {
            file.content_length = file_info.content_length;
            file.content_type = file_info.content_type;
            file.status = FileStatus::Success;
            let file = File::upsert(&conn, &file)?;

            // Generate waveform in case file is mp3 file
            if file.content_type == "audio/mpeg" {
                add_generate_waveform_job(file.uuid);
            }

            Ok(true)
        } else {
            file.status = FileStatus::Failed;
            File::upsert(&conn, &file)?;
            Err(IkigaiError::new_bad_request("File does not exist")).format_err()
        }
    }
}

async fn create_file_upload(
    conn: Connection,
    member: &UserAuth,
    data: CreateFileData,
) -> Result<CreateFileResponse> {
    let CreateFileData {
        file_name,
        content_type,
        content_length,
        public,
    } = data;

    let file = File::new(member.id, public, file_name, content_type, content_length);
    let file = File::upsert(&conn, &file).format_err()?;
    let upload_info = Storage::from_env_config().generate_upload_info(
        file.key(),
        &file.content_type,
        file.content_length,
        public,
    )?;

    Ok(CreateFileResponse { file, upload_info })
}
