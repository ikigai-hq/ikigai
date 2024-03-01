use chrono::{DateTime, Utc};

pub fn get_now() -> DateTime<Utc> {
    Utc::now()
}

pub fn get_now_as_secs() -> i64 {
    get_now().timestamp()
}

pub fn get_now_as_ms() -> i64 {
    get_now().timestamp_millis()
}

pub fn get_datetime_as_ms(dt: DateTime<Utc>) -> i64 {
    dt.timestamp_millis()
}
