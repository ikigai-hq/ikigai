use chrono::{DateTime, Utc};

pub fn get_now() -> DateTime<Utc> {
    Utc::now()
}

pub fn get_now_as_secs() -> i64 {
    get_now().timestamp()
}

pub fn get_datetime_as_secs(dt: DateTime<Utc>) -> i64 {
    dt.timestamp()
}
