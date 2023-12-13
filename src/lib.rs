//! # AJ (Background Job Based On Actix)
//! This repository contains a simple background job that supports a web server based on actix-web or other web/API frameworks in Rust.
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
//! [Architecture Doc](https://github.com/cptrodgers/aj/blob/master/ARCHITECTURE.md)
//!
//! ## Usage:
//!
//! ```rust
//! use std::str::FromStr;
//!
//! use aj::async_trait::async_trait;
//! use aj::Worker;
//! use aj::{Executable, JobBuilder};
//! use aj::serde::{Serialize, Deserialize};
//! use aj::chrono::Utc;
//! use aj::cron::Schedule;
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
//!     Worker::add_job(job);
//! }
//!
//! fn run_job_at() {
//!     //! Now in seconds
//!     let now = Utc::now().timestamp();
//!     let job = JobBuilder::new(PrintJob { number: 2 })
//!         .set_schedule_at(now + 30)
//!         .build();
//!     Worker::add_job(job);
//! }
//!
//! fn run_cron_job() {
//!     //! aj use `cron` crate.
//!     //! Ref: https://docs.rs/cron/latest/cron/
//!     let expression = "0   30   9,12,15     1,15       May-Aug  Mon,Wed,Fri  2018/2";
//!     let schedule = Schedule::from_str(expression).unwrap();
//!     let job = JobBuilder::new(PrintJob { number: 3 })
//!         .set_cron(schedule, aj::CronContext::default())
//!         .build();
//!     Worker::add_job(job);
//! }
//! ```

#[macro_use]
extern crate log;

pub mod db_backend;
pub mod error;
pub mod job;
pub mod queue;
pub mod util;
pub mod worker;

pub use db_backend::*;
pub use error::*;
pub use job::*;
pub use queue::*;
pub use util::*;
pub use worker::*;

// External libs.
pub use async_trait;
pub use chrono;
pub use cron;
pub use serde;
