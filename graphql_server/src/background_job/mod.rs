pub mod document_job;
pub mod storage_job;
pub mod submission_job;

use aj::AJ;

use self::document_job::CreateDocumentHistoryVersion;
use crate::background_job::storage_job::{CheckTranscodingFile, DeleteS3Object, GenerateWaveform};
use crate::background_job::submission_job::CompleteSubmission;

pub fn register_jobs() {
    let url = std::env::var("REDIS_URL").unwrap();
    let redis = aj::redis::Redis::new(url);
    AJ::register::<CompleteSubmission>("complete_submission", redis.clone());
    AJ::register::<DeleteS3Object>("delete_s3_job", redis.clone());
    AJ::register::<CheckTranscodingFile>("check_transcoding_file", redis.clone());
    AJ::register::<GenerateWaveform>("generate_waveform", redis.clone());

    // Document Job
    AJ::register::<CreateDocumentHistoryVersion>("create_document_history_version", redis);
}
