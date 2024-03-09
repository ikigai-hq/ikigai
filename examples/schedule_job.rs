use actix_rt::time::sleep;

use aj::async_trait::async_trait;
use aj::chrono::Duration;
use aj::mem::InMemory;
use aj::serde::{Deserialize, Serialize};
use aj::{get_now, start_engine};
use aj::{get_now_as_ms, AJ};
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

fn run_schedule_job() {
    let job = JobBuilder::new(PrintJob { number: 1 })
        .set_schedule_at(get_now() + Duration::seconds(3))
        .build();
    AJ::add_job(job);
}

fn main() {
    start_engine();
    let backend = InMemory::default();
    AJ::register::<PrintJob>("print_job", backend);
    println!("Now is {}", get_now_as_ms());
    run_schedule_job();

    // Sleep
    std::thread::spawn(|| {
        actix_rt::System::new().block_on(async {
            sleep(std::time::Duration::from_secs(6)).await;
        })
    })
    .join()
    .expect("Cannot spawn thread");
}
