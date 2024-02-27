use actix_rt::time::sleep;
use std::time::Duration;

use aj::async_trait::async_trait;
use aj::mem::InMemory;
use aj::serde::{Deserialize, Serialize};
use aj::{get_now_as_secs, AJ};
use aj::{Executable, JobBuilder};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrintJob {
    pub number: i32,
}

#[async_trait]
impl Executable for PrintJob {
    type Value = ();
    type Error = ();

    async fn execute(&self) -> Result<Self::Value, Self::Error> {
        // Do your stuff here in async mode
        println!(
            "Hello in background {} at {}",
            self.number,
            get_now_as_secs()
        );
        Ok(())
    }
}

fn run_schedule_job(id: String) {
    let job = JobBuilder::new(PrintJob { number: 1 })
        .set_id(id)
        .set_schedule_at(get_now_as_secs() + 5)
        .build();
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
    println!("Now is {}", get_now_as_secs());

    let job_id: String = "1".into();
    run_schedule_job(job_id.clone());
    cancel_job(job_id);

    // Sleep
    std::thread::spawn(|| {
        actix_rt::System::new().block_on(async {
            sleep(Duration::from_secs(10)).await;
        })
    })
    .join()
    .expect("Cannot spawn thread");
}
