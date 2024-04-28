use std::fs::File;
use std::io::Read;
use std::process::Command;
use uuid::Uuid;

use crate::error::IkigaiError;
use crate::service::Storage;

pub struct AudioWaveform;

impl AudioWaveform {
    pub async fn generate_waveform_json(
        file_id: Uuid,
        key: &str,
        extension: &str,
    ) -> Result<String, IkigaiError> {
        let current_dir = std::env::current_dir()?;
        let input_path = format!(
            "{}/tmp_data/{}_waveform.json",
            current_dir.display(),
            file_id
        );
        let download_path = format!(
            "{}/tmp_data/{}.{}",
            current_dir.display(),
            file_id,
            extension
        );

        Storage::from_env_config()
            .download_file(key, &download_path)
            .await?;

        let output = Command::new("audiowaveform")
            .args(["-i", &download_path])
            .args(["-o", &input_path])
            .args(["--pixels-per-second", "20", "--bits", "8"])
            .output()?;
        info!("Generate waveform for {file_id} - status: {output:?}");

        let mut waveform_json_string = String::new();
        File::open(input_path)?.read_to_string(&mut waveform_json_string)?;

        Ok(waveform_json_string)
    }
}
