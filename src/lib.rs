//! # AJ (Background Job Based On Actix)
//!
//! aj is a one-stop solution for your background (schedule, cron) job needs in Rust systems.
//!
//! - `Simple`:
//!   - Easy to integrate into your application.
//!   - Freedom to choose your backend (Redis by default). You just need to implement the `Backend` trait to your storage and plug it into the worker.
//! - `Flexible`:
//!   - Supports rich features like `update`, `cancel`, `schedule`, `cron` that can fulfill all your needs. You don't need to find other crates for your system.
//!   - Control velocity/throughput of your worker/queue. (In Roadmap)
//!   - Web Interface to control (In roadmap)
//! - `Reliable`:
//!   - Persistent by default (Redis by default).
//!   - No unsafe code, 100% Rust.
//!
//! ## Usage:
//! View [Examples](https://github.com/cptrodgers/aj/blob/master/examples).
//!
//! ```rust
//! use std::str::FromStr;
//! use std::time::Duration;
//! use actix_rt::time::sleep;
//!
//! use aj::async_trait::async_trait;
//! use aj::AJ;
//! use aj::{Executable, JobBuilder};
//! use aj::serde::{Serialize, Deserialize};
//! use aj::chrono::Utc;
//! use aj::cron::Schedule;
//! use aj::mem::InMemory;
//! use aj::rt;
//!
//! #[derive(Debug, Clone, Serialize, Deserialize)]
//! pub struct PrintJob {
//!     pub number: i32,
//! }
//!
//! #[async_trait]
//! impl Executable for PrintJob {
//!     async fn execute(&self) {
//!         //! Do your stuff here in async mode
//!         print!("Hello in background {}", self.number);
//!     }
//! }
//!
//! fn run_job_instantly() {
//!     let job = JobBuilder::new(PrintJob { number: 1 }).build();
//!     AJ::add_job(job);
//! }
//!
//! fn run_job_at() {
//!     //! Now in seconds
//!     let now = Utc::now().timestamp();
//!     let job = JobBuilder::new(PrintJob { number: 2 })
//!         .set_schedule_at(now + 3)
//!         .build();
//!     AJ::add_job(job);
//! }
//!
//! fn run_cron_job() {
//!     //! aj use `cron` crate.
//!     //! Ref: https://docs.rs/cron/latest/cron/
//!     let expression = "* * * * * * *";
//!     let schedule = Schedule::from_str(expression).unwrap();
//!     let job = JobBuilder::new(PrintJob { number: 3 })
//!         .set_cron(schedule, aj::CronContext::default())
//!         .build();
//!     AJ::add_job(job);
//! }
//!
//! #[rt]
//! async fn main() {
//!     let mem = InMemory::default();
//!     AJ::register::<PrintJob>("print_job", mem);
//!     run_job_instantly();
//!     run_job_at();
//!     run_cron_job();
//!     sleep(Duration::from_secs(5)).await;
//! }
//! ```

#[macro_use]
extern crate log;

pub mod aj;
pub mod db_backend;
pub mod error;
pub mod job;
pub mod queue;
pub mod util;

pub use aj::*;
pub use db_backend::*;
pub use error::*;
pub use job::*;
pub use queue::*;
pub use util::*;

// External libs.
pub use actix_rt::main as rt;
pub use async_trait;
pub use chrono;
pub use cron;
pub use serde;
