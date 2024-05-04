pub mod storage_job;
pub mod submission_job;

use aj::AJ;

use crate::background_job::storage_job::GenerateWaveform;
use crate::background_job::submission_job::CompleteSubmission;

pub fn register_jobs() {
    let url = std::env::var("REDIS_URL").unwrap();
    let redis = aj::redis::Redis::new(url);
    AJ::register::<CompleteSubmission>("complete_submission", redis.clone());
    AJ::register::<GenerateWaveform>("generate_waveform", redis);
}
