#[macro_use]
extern crate log;

use actix_rt::System;

pub mod aj;
pub mod backend;
pub mod error;
pub mod job;
pub mod queue;
pub mod util;

pub use aj::*;
pub use backend::*;
pub use error::*;
pub use job::*;
pub use queue::*;
pub use util::*;

// External libs.
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
            info!("start an actix runtime in current thread");
            let _ = System::new();
        }
    }
}
