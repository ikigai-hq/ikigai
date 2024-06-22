use actix_rt::time::sleep;
use std::time::Duration;

use aj::async_trait::async_trait;
use aj::mem::InMemory;
use aj::serde::{Deserialize, Serialize};
use aj::{get_now, get_now_as_ms, JobType, AJ};
use aj::{Executable, JobBuilder};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrintJob {
    pub number: i32,
}

#[async_trait]
impl Executable for PrintJob {
    type Output = ();

    async fn execute(&self) -> Self::Output {
        // Do your stuff here in async mode
        println!("Hello in background {} at {}", self.number, get_now_as_ms(),);
    }
}

fn run_schedule_job(id: String) {
    let job = JobBuilder::default()
        .message(PrintJob { number: 1 })
        .id(id)
        .job_type(JobType::ScheduledAt(
            get_now() + chrono::Duration::seconds(1),
        ))
        .build()
        .unwrap();
    AJ::add_job(job);
}

fn cancel_job(id: String) {
    AJ::cancel_job::<PrintJob>(id);
}

fn main() {
    // Start engine and register job
    aj::start_engine();
    let backend = InMemory::default();
    AJ::register::<PrintJob>("print_job", backend);
    println!("Now is {}", get_now_as_ms());

    let job_id: String = "1".into();
    run_schedule_job(job_id.clone());
    cancel_job(job_id);

    // Sleep
    std::thread::spawn(|| {
        actix_rt::System::new().block_on(async {
            sleep(Duration::from_secs(2)).await;
        })
    })
    .join()
    .expect("Cannot spawn thread");
}
