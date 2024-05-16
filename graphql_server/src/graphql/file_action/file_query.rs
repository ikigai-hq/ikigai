use crate::authorization::DocumentActionPermission;
use crate::background_job::storage_job::add_generate_waveform_job;
use async_graphql::*;
use uuid::Uuid;

use crate::db::file::File;
use crate::error::IkigaiErrorExt;
use crate::helper::{document_quick_authorize, get_conn_from_ctx};

#[derive(Default)]
pub struct FileQuery;

#[Object]
impl FileQuery {
    async fn get_file(&self, ctx: &Context<'_>, file_id: Uuid) -> Result<File> {
        let conn = get_conn_from_ctx(ctx).await?;
        let file = File::find_by_id(&conn, file_id).format_err()?;
        Ok(file)
    }

    async fn file_waveform(
        &self,
        ctx: &Context<'_>,
        file_id: Uuid,
        document_id: Uuid,
    ) -> Result<Option<String>> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ViewDocument).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        // FIXME: Check file is existing in document

        let file = File::find_by_id(&conn, file_id).format_err()?;
        let is_mp3_file = file.content_type == "audio/mpeg";
        if is_mp3_file && file.waveform_audio_json_str.is_none() {
            add_generate_waveform_job(file.uuid);
        }

        Ok(file.waveform_audio_json_str)
    }
}
