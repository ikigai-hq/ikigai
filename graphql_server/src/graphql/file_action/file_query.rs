use crate::authorization::DocumentActionPermission;
use crate::background_job::storage_job::add_generate_waveform_job;
use async_graphql::*;
use uuid::Uuid;

use crate::db::file::File;
use crate::db::Document;
use crate::error::OpenExamErrorExt;
use crate::helper::{document_quick_authorize, get_conn_from_ctx};
use crate::service::Storage;

#[derive(Default)]
pub struct FileQuery;

#[Object]
impl FileQuery {
    async fn get_file(&self, ctx: &Context<'_>, file_id: Uuid) -> Result<File> {
        let conn = get_conn_from_ctx(ctx).await?;
        let file = File::find_by_id(&conn, file_id).format_err()?;
        Ok(file)
    }

    async fn file_get_download_transcoding_url(
        &self,
        ctx: &Context<'_>,
        file_id: Uuid,
        document_id: Uuid,
    ) -> Result<Option<String>> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ViewDocument).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let document = Document::find_by_id(&conn, document_id).format_err()?;
        if !document.body.contains(&file_id.to_string()) {
            return Ok(None);
        }
        let file = File::find_by_id(&conn, file_id).format_err()?;

        if let Some(transcoding_key) = file.transcoding_output_key {
            let download_url = Storage::from_env_config()
                .get_download_url(&transcoding_key, 7200, None)
                .await
                .format_err()?;
            Ok(Some(download_url))
        } else {
            Ok(None)
        }
    }

    async fn file_waveform(
        &self,
        ctx: &Context<'_>,
        file_id: Uuid,
        document_id: Uuid,
    ) -> Result<Option<String>> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ViewDocument).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let document = Document::find_by_id(&conn, document_id).format_err()?;
        if !document.body.contains(&file_id.to_string()) {
            return Ok(None);
        }

        let file = File::find_by_id(&conn, file_id).format_err()?;
        let is_mp3_file = file.content_type == "audio/mpeg"
            || file.transcoding_output_content_type.as_deref() == Some("audio/mpeg");
        if is_mp3_file && file.waveform_audio_json_str.is_none() {
            add_generate_waveform_job(file.uuid);
        }

        Ok(file.waveform_audio_json_str)
    }
}