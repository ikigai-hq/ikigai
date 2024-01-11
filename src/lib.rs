//! ## Usage:
//!
//! View [Examples](https://github.com/cptrodgers/aj/blob/master/examples).
//!

#[macro_use]
extern crate log;

use actix_rt::System;

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

pub fn start_engine() {
    match System::try_current() {
        Some(_) => {
            info!("Found actix runtime in current thread, re-use it");
        }
        None => {
            info!("starting an actix runtime in current thread");
            let _ = System::new();
            info!("started an actix runtime in current thread");
        }
    }
}
