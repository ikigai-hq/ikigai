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
    async fn execute(&self) {
        // Do your stuff here in async mode
        println!(
            "Hello in background {} at {}",
            self.number,
            get_now_as_secs()
        );
    }
}

fn run_schedule_job(id: String, number: i32) {
    let job = JobBuilder::new(PrintJob { number })
        .set_id(id)
        .set_schedule_at(get_now_as_secs() + 5)
        .build();
    AJ::add_job(job);
}

fn main() {
    aj::start_engine();

    let backend = InMemory::default();
    AJ::register::<PrintJob>("print_job", backend);
    println!("Now is {}", get_now_as_secs());
    let job_id: String = "1".into();
    run_schedule_job(job_id.clone(), 1);
    // It update data to 3, so the console will print 3 instead of 1
    run_schedule_job(job_id, 3);

    // Sleep
    std::thread::spawn(|| {
        actix_rt::System::new().block_on(async {
            sleep(Duration::from_secs(6)).await;
        })
    })
    .join()
    .expect("Cannot spawn thread");
}
