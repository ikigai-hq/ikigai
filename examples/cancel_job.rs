use actix_rt::time::sleep;
use std::time::Duration;

use aj::async_trait::async_trait;
use aj::mem::InMemory;
use aj::rt;
use aj::serde::{Deserialize, Serialize};
use aj::{get_now_as_secs, Worker};
use aj::{Executable, JobBuilder};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrintJob {
    pub number: i32,
}

#[async_trait]
impl Executable for PrintJob {
    async fn execute(&self) {
        // Do your stuff here in async mode
        println!(
            "Hello in background {} at {}",
            self.number,
            get_now_as_secs()
        );
    }
}

fn run_schedule_job(id: String) {
    let job = JobBuilder::new(PrintJob { number: 1 })
        .set_id(id)
        .set_schedule_at(get_now_as_secs() + 5)
        .build();
    Worker::add_job(job);
}

fn cancel_job(id: String) {
    Worker::cancel_job::<PrintJob>(id);
}

#[rt]
async fn main() {
    let backend = InMemory::default();
    Worker::register::<PrintJob>("print_job", backend);
    println!("Now is {}", get_now_as_secs());
    let job_id: String = "1".into();
    run_schedule_job(job_id.clone());
    cancel_job(job_id);
    sleep(Duration::from_secs(10)).await;
}
