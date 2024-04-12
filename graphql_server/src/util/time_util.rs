use chrono::{TimeZone, Utc};

pub fn format_date_time_in_vietnam(ts: i64) -> String {
    // FIXME: UTC is +0, so, we convert to +7, but it's not good mechanism -> remove in future
    Utc.timestamp_opt(ts + 7 * 3600, 0)
        .unwrap()
        .format("%d/%m/%Y %H:%M")
        .to_string()
}
