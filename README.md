# aj (Actix Background Job) ![ci status](https://github.com/cptrodgers/aj/actions/workflows/test-and-build.yml/badge.svg)

aj is a one-stop solution for your background jobs (includes schedule, cron) in Actix system.

[Docs](https://github.com/cptrodgers/aj/blob/master/docs)

## Usage ([examples](https://github.com/cptrodgers/aj/tree/master/examples))

```rust
use actix_rt::time::sleep;

use aj::async_trait::async_trait;
use aj::AJ;
use aj::{Executable, JobBuilder};
use aj::serde::{Serialize, Deserialize};
use aj::mem::InMemory;

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

fn main() {
	aj::start(async {
        let mem = InMemory::default();
        AJ::register::<PrintJob>("print_job", mem);
        let job = JobBuilder::new(PrintJob { number: 1 }).build();
        AJ::add_job(job);
        sleep(Duration::from_secs(1)).await;
	});
}
```

## `aj` in Production

- [ZenClass](https://zenclass.co): uses `aj` to build their reminder system (reminder at specific time or monthly, weekly, daily repeat reminder).

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
