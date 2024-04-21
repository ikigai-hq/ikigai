use aj::async_trait::async_trait;
use aj::{Executable, JobBuilder, Retry, AJ};
use chrono::Duration;
use uuid::Uuid;

use crate::connection_pool::get_conn_from_actor;
use crate::db::File;
use crate::error::OpenExamError;
use crate::service::audio_waveform::AudioWaveform;

pub fn add_generate_waveform_job(file_id: Uuid) {
    let job_id = format!("generate_waveform_{file_id}");
    let job = JobBuilder::new(GenerateWaveform { file_id })
        .set_id(job_id)
        .set_retry(Retry::new_interval_retry(
            Some(5),
            Duration::try_seconds(10).unwrap(),
        ))
        .build();

    AJ::add_job(job);
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateWaveform {
    pub file_id: Uuid,
}

#[async_trait]
impl Executable for GenerateWaveform {
    type Output = Result<bool, OpenExamError>;

    async fn execute(&self) -> Self::Output {
        info!("Start generate waveform {}", self.file_id);
        let file = {
            let conn = get_conn_from_actor().await?;
            File::find_by_id(&conn, self.file_id)?
        };

        let key = if file.content_type.contains("audio/mpeg") {
            Some(file.key())
        } else {
            file.transcoding_output_key.clone()
        };

        let res = if let Some(key) = key {
            let waveform_json_str =
                AudioWaveform::generate_waveform_json(file.uuid, &key, "mp3").await?;

            info!("Save waveform {}", self.file_id);
            let conn = get_conn_from_actor().await?;
            File::update_waveform(&conn, file.uuid, &waveform_json_str)?;
            true
        } else {
            false
        };

        Ok(res)
    }

    fn is_failed_output(&self, job_output: &Self::Output) -> bool {
        match job_output {
            Ok(success) => !*success,
            _ => true,
        }
    }
}
