# aj ![ci status](https://github.com/cptrodgers/aj/actions/workflows/test-and-build.yml/badge.svg)

aj is a one-stop solution for your background jobs (includes schedule, cron) based on actix engine (actor model).

This project is under development.

[Docs](https://github.com/zenclasshq/aj/blob/master/docs)

## Usage ([examples](https://github.com/zenclasshq/aj/tree/master/examples))

```rust
use actix_rt::time::sleep;
use std::time::Duration;
use actix_rt::System;

use aj::async_trait::async_trait;
use aj::mem::InMemory;
use aj::serde::{Deserialize, Serialize};
use aj::{get_now_as_ms, start_engine, AJ};
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
        println!(
            "Hello in background {} at {}",
            self.number,
            get_now_as_ms()
        );
        Ok(())
    }
}

fn run_job_instantly() {
    let job = JobBuilder::new(PrintJob { number: 1 }).build();
    AJ::add_job(job);
}

fn main() {
    start_engine();
    let backend = InMemory::default();
    AJ::register::<PrintJob>("print_job", backend);
    println!("Now is {}", get_now_as_ms());
    run_job_instantly();

    // Sleep 1 sec
    std::thread::spawn(|| {
       System::new().block_on(async {
           sleep(Duration::from_secs(1)).await;
       })
    })
        .join()
        .expect("Cannot spawn thread");
}
```

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
