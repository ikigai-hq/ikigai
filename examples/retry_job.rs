use actix_rt::time::sleep;
use actix_rt::System;
use std::time::Duration;

use aj::async_trait::async_trait;
use aj::mem::InMemory;
use aj::serde::{Deserialize, Serialize};
use aj::{get_now_as_ms, start_engine, Retry, AJ};
use aj::{Executable, JobBuilder};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryJob;

#[async_trait]
impl Executable for RetryJob {
    type Output = Result<(), ()>;

    async fn execute(&self) -> Self::Output {
        println!("Intent to fail job {}", get_now_as_ms());
        Err(())
    }

    fn is_failed_output(&self, job_output: &Self::Output) -> bool {
        job_output.is_err()
    }
}

fn run_retry_job() {
    let retry = Retry::default();
    let job = JobBuilder::new(RetryJob).set_retry(retry).build();
    AJ::add_job(job);
}

fn main() {
    start_engine();
    let backend = InMemory::default();
    AJ::register::<RetryJob>("retry_job", backend);
    println!("Now is {}", get_now_as_ms());
    run_retry_job();

    // Sleep 1 sec
    std::thread::spawn(|| {
        System::new().block_on(async {
            sleep(Duration::from_secs(5)).await;
        })
    })
    .join()
    .expect("Cannot spawn thread");
}
