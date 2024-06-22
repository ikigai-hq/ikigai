use chrono::{DateTime, TimeZone, Utc};

pub fn get_now() -> DateTime<Utc> {
    Utc::now()
}

pub fn get_now_as_secs() -> i64 {
    get_now().timestamp()
}

pub fn get_now_as_ms() -> i64 {
    get_now().timestamp_millis()
}

pub fn get_ms_as_datetime(ms: i64) -> DateTime<Utc> {
    Utc.timestamp_nanos(ms * 1_000_000)
}
