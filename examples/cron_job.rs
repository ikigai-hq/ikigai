use actix_rt::time::sleep;
use std::str::FromStr;
use std::time::Duration;

use aj::async_trait::async_trait;
use aj::cron::Schedule;
use aj::mem::InMemory;
use aj::rt;
use aj::serde::{Deserialize, Serialize};
use aj::{get_now_as_secs, CronContext, AJ};
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

fn run_simple_cron_job() {
    let expression = "* * * * * * *";
    let schedule = Schedule::from_str(expression).unwrap();
    let job = JobBuilder::new(PrintJob { number: 1 })
        .set_cron(schedule, CronContext::default())
        .build();
    AJ::add_job(job);
}

fn run_cron_job_with_condition() {
    let expression = "* * * * * * *";
    let schedule = Schedule::from_str(expression).unwrap();

    let mut context = CronContext::default();
    context.max_repeat = Some(3); // Run 3 times

    let job = JobBuilder::new(PrintJob { number: 2 })
        .set_cron(schedule, context)
        .build();
    AJ::add_job(job);
}

#[rt]
async fn main() {
    let backend = InMemory::default();
    AJ::register::<PrintJob>("print_job", backend);
    println!("Now is {}", get_now_as_secs());
    run_simple_cron_job();
    run_cron_job_with_condition();
    sleep(Duration::from_secs(10)).await;
}
