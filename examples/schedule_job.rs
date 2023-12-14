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

fn run_schedule_job() {
    let job = JobBuilder::new(PrintJob { number: 1 })
        .set_schedule_at(get_now_as_secs() + 5)
        .build();
    Worker::add_job(job);
}

#[rt]
async fn main() {
    let backend = InMemory::default();
    Worker::register::<PrintJob>("print_job", backend);
    println!("Now is {}", get_now_as_secs());
    run_schedule_job();
    sleep(Duration::from_secs(10)).await;
}
