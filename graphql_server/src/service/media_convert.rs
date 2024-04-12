use std::env::var;

use aws_config::meta::region::RegionProviderChain;
use aws_sdk_mediaconvert::model::{
    FileGroupSettings, Input, JobSettings, OutputGroup, OutputGroupSettings,
};
use aws_sdk_mediaconvert::{Client, Endpoint, Region};

use crate::error::OpenExamError;

const MP4_CONVERTING_JOB_TEMPLATE_NAME: &str =
    "arn:aws:mediaconvert:ap-southeast-1:700023370927:jobTemplates/webm-to-mp4";
const MP3_CONVERTING_JOB_TEMPLATE_NAME: &str =
    "arn:aws:mediaconvert:ap-southeast-1:700023370927:jobTemplates/audio-to-mp3";
const ROLE: &str = "arn:aws:iam::700023370927:role/media-convert";
const CONVERT_ENDPOINT: &str = "https://sndcwvubb.mediaconvert.ap-southeast-1.amazonaws.com";

fn get_extension(template: &str) -> &str {
    if template == MP4_CONVERTING_JOB_TEMPLATE_NAME {
        "mp4"
    } else {
        "mp3"
    }
}

pub struct MediaConvert {
    region: String,
    bucket: String,
}

impl MediaConvert {
    pub fn init() -> Self {
        let region = var("AWS_REGION").unwrap_or("ap-southeast-1".into());
        let bucket = var("S3_BUCKET").unwrap();
        Self { region, bucket }
    }

    async fn get_client(&self) -> Client {
        let region_provider = RegionProviderChain::first_try(Region::new(self.region.clone()))
            .or_else("ap-southeast-1");
        let config = aws_config::from_env()
            .endpoint_resolver(Endpoint::immutable(
                CONVERT_ENDPOINT.parse().expect("valid URI"),
            ))
            .region(region_provider)
            .load()
            .await;
        Client::new(&config)
    }

    pub async fn transcoding(&self, key: &str, template: &str) -> Result<String, OpenExamError> {
        // Input Format: s3://{bucket}/key
        let input = format!("s3://{bucket}/{key}", bucket = self.bucket, key = key);
        // Output format: s3://{bucket}/key
        let output_key = format!("{key}_transcoding");
        let output = format!(
            "s3://{bucket}/{output_key}",
            bucket = self.bucket,
            output_key = output_key,
        );

        let input = Input::builder().file_input(input).build();
        let output_group = OutputGroup::builder()
            .output_group_settings(
                OutputGroupSettings::builder()
                    .file_group_settings(FileGroupSettings::builder().destination(output).build())
                    .build(),
            )
            .build();
        let settings = JobSettings::builder()
            .inputs(input)
            .output_groups(output_group)
            .build();

        // Add job
        let client = self.get_client().await;
        client
            .create_job()
            .role(ROLE)
            .job_template(template)
            .settings(settings)
            .send()
            .await?;

        // AWS will auto add extension .mp3 into converted file
        let extension = get_extension(template);
        Ok(format!("{output_key}.{extension}"))
    }

    pub async fn transcoding_to_mp4(&self, key: &str) -> Result<String, OpenExamError> {
        self.transcoding(key, MP4_CONVERTING_JOB_TEMPLATE_NAME)
            .await
    }

    pub async fn transcoding_to_mp3(&self, key: &str) -> Result<String, OpenExamError> {
        self.transcoding(key, MP3_CONVERTING_JOB_TEMPLATE_NAME)
            .await
    }
}
