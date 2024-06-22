use actix_rt::time::sleep;
use std::time::Duration;

use aj::async_trait::async_trait;
use aj::mem::InMemory;
use aj::serde::{Deserialize, Serialize};
use aj::{get_now_as_ms, CronContext, JobType, AJ};
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

fn run_simple_cron_job() {
    let expression = "* * * * * * *";
    let job_type = JobType::init_cron(expression, CronContext::default()).unwrap();
    let job = JobBuilder::default()
        .message(PrintJob { number: 1 })
        .job_type(job_type)
        .build()
        .unwrap();
    AJ::add_job(job);
}

fn run_cron_job_with_condition() {
    let expression = "* * * * * * *";
    let mut context = CronContext::default();
    context.max_repeat = Some(3); // Run 3 times
    let job_type = JobType::init_cron(expression, context).unwrap();
    let job = JobBuilder::default()
        .message(PrintJob { number: 2 })
        .job_type(job_type)
        .build()
        .unwrap();
    println!("{:?}", job);
    AJ::add_job(job);
}

fn main() {
    aj::start_engine();
    let backend = InMemory::default();
    AJ::register::<PrintJob>("print_job", backend);
    println!("Now is {}", get_now_as_ms());
    run_simple_cron_job();
    run_cron_job_with_condition();

    // Sleep
    std::thread::spawn(|| {
        actix_rt::System::new().block_on(async {
            sleep(Duration::from_secs(10)).await;
        })
    })
    .join()
    .expect("Cannot spawn thread");
}
