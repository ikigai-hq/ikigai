# aj (Actix Background Job)

This repository contains a simple background job that supports a web server based on actix-web or other web/API frameworks in Rust.

aj wants to solve the background job done in the simple way by using Actor Model.
The architecture aim to achieve:
- Reliable: aj support `persistent job` by default and aj.
- Flexible: aj also supports add, update, cancel to help you to control your background logics.

[Architecture Doc](https://github.com/cptrodgers/aj/blob/master/ARCHITECTURE.md)

## Usage:

```rust
use aj::async_trait::async_trait;
use aj::Worker;
use aj::{Executable, JobBuilder};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrintJob {
    pub number: i32,
}

#[async_trait]
impl Executable for PrintJob {
    async fn execute(&self) {
        // Do your stuff here in async mode
        print!("Hello in background {}", self.number);
    }
}

fn run_job_instantly() {
    let job = JobBuilder::new(PrintJob { number: 1 }).build();
    Worker::add_job(job);
}

fn run_job_at() {
    // Now in seconds
    let now = get_now_at_sec();
    let job = JobBuilder::new(PrintJob { number: 2 })
        .set_schedule_at(now + 30) // Run after now 30 secs
        .build();
    Worker::add_job(job);
}

fn run_cron_job() {
    // aj use `cron` crate.
    // Ref: https://docs.rs/cron/latest/cron/
    let job = JobBuilder::new(PrintJob { number: 3 })
        .set_cron("0   30   9,12,15     1,15       May-Aug  Mon,Wed,Fri  2018/2")
        .build();
    Worker::add_job(job);
}

fn main() {
    let redis = aj::redis::Redis::new("redis://localhost/");
    Worker::register::<PrintJob>("print_task", redis);
    run_job_instantly();
    run_job_at();
    run_cron_job();
}
```

More

## LICENSE

<sup>
Licensed under either of <a href="LICENSE-APACHE">Apache License, Version
2.0</a> or <a href="LICENSE-MIT">MIT license</a> at your option.
</sup>

<br>

<sub>
Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in aj by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
</sub>