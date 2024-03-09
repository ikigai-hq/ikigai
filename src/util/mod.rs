use chrono::{DateTime, Utc};

pub fn get_now() -> DateTime<Utc> {
    Utc::now()
}

pub fn get_now_as_ms() -> i64 {
    get_now().timestamp_millis()
}
