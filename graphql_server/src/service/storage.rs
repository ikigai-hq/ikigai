#![allow(dead_code)]
use async_graphql::futures_util::TryStreamExt;
use std::collections::HashMap;
use std::env::var;
use std::fs::File;
use std::io::Write;
use std::time::Duration;

use aws_config::meta::region::RegionProviderChain;
use aws_sdk_s3::model::{CompletedMultipartUpload, CompletedPart};
use aws_sdk_s3::output::{CompleteMultipartUploadOutput, CreateMultipartUploadOutput};
use aws_sdk_s3::types::ByteStream;
use aws_sdk_s3::{presigning::config::PresigningConfig, Client, Region};
use simple_aws_s3::*;
use urlencoding::encode;

use crate::error::OpenAssignmentError;

#[derive(Debug, Clone, SimpleObject)]
pub struct UploadInfo {
    pub upload_url: String,
    pub fields: HashMap<String, String>,
}

#[derive(Debug, Clone)]
pub struct FileInfo {
    pub content_type: String,
    pub content_length: i64,
}

#[derive(Debug, Clone)]
pub struct Storage {
    pub s3: S3,
    s3_bucket: String,
    aws_region: String,
}

impl Default for Storage {
    fn default() -> Self {
        Self::from_env_config()
    }
}

impl Storage {
    #[inline]
    pub fn new(
        endpoint: impl Into<String> + Copy,
        region: impl Into<String> + Copy,
        access_key: impl Into<String> + Copy,
        secret_key: impl Into<String> + Copy,
        bucket: impl Into<String> + Copy,
    ) -> Self {
        Self {
            s3_bucket: bucket.into(),
            aws_region: region.into(),
            s3: S3::new(bucket, region, endpoint, access_key, secret_key),
        }
    }

    #[inline]
    pub fn from_env_config() -> Self {
        Self::new(
            &var("S3_ENDPOINT").unwrap(),
            &var("AWS_REGION").unwrap(),
            &var("AWS_ACCESS_KEY_ID").unwrap(),
            &var("AWS_SECRET_ACCESS_KEY").unwrap(),
            &var("S3_BUCKET").unwrap(),
        )
    }

    pub async fn get_client(&self) -> Client {
        let region_provider = RegionProviderChain::first_try(Region::new(self.aws_region.clone()))
            .or_else("ap-southeast-1");
        let config = aws_config::from_env().region(region_provider).load().await;
        Client::new(&config)
    }

    #[allow(deprecated)]
    pub fn generate_upload_info(
        &self,
        key: String,
        content_type: &str,
        content_length: i64,
        public: bool,
    ) -> Result<UploadInfo, OpenAssignmentError> {
        let acl = if public { Some("public-read") } else { None };
        let expire_on = chrono::Duration::seconds(3600);
        let info =
            self.s3
                .generate_presigned_post(key, content_type, content_length, expire_on, acl)?;

        Ok(UploadInfo {
            upload_url: info.upload_url,
            fields: info.params,
        })
    }

    pub async fn get_download_url(
        &self,
        key: &str,
        expire_in: u64,
        file_name: Option<String>,
    ) -> Result<String, OpenAssignmentError> {
        let client = self.get_client().await;
        let mut req = client.get_object().bucket(&self.s3_bucket).key(key);

        if let Some(file_name) = file_name {
            let encoded_name = encode(&file_name);
            req = req
                .response_content_disposition(format!("attachment; filename=\"{encoded_name}\""));
        }

        let download_request = req
            .presigned(PresigningConfig::expires_in(Duration::from_secs(expire_in)).unwrap())
            .await?;
        Ok(download_request.uri().to_string())
    }

    pub async fn get_file_info(&self, key: String) -> Result<Option<FileInfo>, OpenAssignmentError> {
        let client = self.get_client().await;
        let head_data = client
            .head_object()
            .bucket(self.s3_bucket.as_str())
            .key(key)
            .send()
            .await?;

        let res = if let (Some(content_type), content_length) =
            (head_data.content_type, head_data.content_length)
        {
            Some(FileInfo {
                content_type,
                content_length,
            })
        } else {
            None
        };

        Ok(res)
    }

    pub async fn delete_file(&self, key: &str) -> Result<(), OpenAssignmentError> {
        let client = self.get_client().await;
        client
            .delete_object()
            .bucket(self.s3_bucket.as_str())
            .key(key)
            .send()
            .await?;
        Ok(())
    }

    pub async fn upload_bytes(
        &self,
        key: &str,
        content_type: &str,
        data: ByteStream,
    ) -> Result<(), OpenAssignmentError> {
        let client = self.get_client().await;
        client
            .put_object()
            .bucket(&self.s3_bucket.clone())
            .key(key)
            .content_type(content_type)
            .body(data)
            .send()
            .await?;
        Ok(())
    }

    // Doc: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-upload-object.html
    pub async fn create_multiple_part(
        &self,
        key: &str,
        content_type: &str,
    ) -> Result<CreateMultipartUploadOutput, OpenAssignmentError> {
        let client = self.get_client().await;
        let multipart_upload_res = client
            .create_multipart_upload()
            .bucket(&self.s3_bucket.clone())
            .key(key)
            .content_type(content_type)
            .send()
            .await?;
        Ok(multipart_upload_res)
    }

    pub async fn upload_part(
        &self,
        key: &str,
        upload_id: &str,
        part_number: i32, // Start from 1
        data: ByteStream,
    ) -> Result<CompletedPart, OpenAssignmentError> {
        let client = self.get_client().await;
        let upload_part_res = client
            .upload_part()
            .key(key)
            .bucket(&self.s3_bucket.clone())
            .upload_id(upload_id)
            .body(data)
            .part_number(part_number)
            .send()
            .await?;

        Ok(CompletedPart::builder()
            .e_tag(upload_part_res.e_tag.unwrap_or_default())
            .part_number(part_number)
            .build())
    }

    pub async fn complete_multiple_part(
        &self,
        key: &str,
        upload_id: &str,
        completed_parts: Vec<CompletedPart>,
    ) -> Result<CompleteMultipartUploadOutput, OpenAssignmentError> {
        let completed_multipart_upload = CompletedMultipartUpload::builder()
            .set_parts(Some(completed_parts))
            .build();
        let client = self.get_client().await;
        let upload_part_res = client
            .complete_multipart_upload()
            .key(key)
            .bucket(&self.s3_bucket.clone())
            .multipart_upload(completed_multipart_upload)
            .upload_id(upload_id)
            .send()
            .await?;

        Ok(upload_part_res)
    }

    pub async fn download_file(
        &self,
        key: &str,
        download_path: &str,
    ) -> Result<usize, OpenAssignmentError> {
        let mut download_file = File::create(download_path)?;
        let client = self.get_client().await;
        let mut object = client
            .get_object()
            .bucket(&self.s3_bucket)
            .key(key)
            .send()
            .await?;

        let mut byte_count = 0_usize;
        while let Ok(Some(bytes)) = object.body.try_next().await {
            let bytes_len = bytes.len();
            download_file.write_all(&bytes)?;
            byte_count += bytes_len;
        }

        Ok(byte_count)
    }
}
