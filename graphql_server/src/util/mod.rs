#![allow(dead_code)]
use crate::constant::{FIRST_MONDAY_TIMESTAMP, TOTAL_SECONDS_OF_A_WEEK};
use chrono::{DateTime, Datelike, TimeZone, Timelike, Utc, Weekday};
use pbkdf2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Pbkdf2,
};
use rand::Rng;
use rand_core::OsRng;

pub mod log_util;
pub mod markdown_util;
pub mod time_util;
pub mod url_util;

pub fn get_now_as_secs() -> i64 {
    Utc::now().timestamp()
}

pub fn get_datetime_as_secs(dt: DateTime<Utc>) -> i64 {
    dt.timestamp()
}

pub fn get_now_week_day() -> Weekday {
    Utc::now().weekday()
}

pub fn get_now() -> DateTime<Utc> {
    Utc::now()
}

pub fn get_date_from_ts(ts: i64) -> DateTime<Utc> {
    DateTime::from_timestamp(ts, 0).unwrap_or_default()
}

pub fn started_of_day(timestamp: i64) -> i64 {
    Utc.timestamp_opt(timestamp, 0)
        .unwrap()
        .with_hour(0)
        .unwrap()
        .with_minute(0)
        .unwrap()
        .with_second(0)
        .unwrap()
        .timestamp()
}

pub fn get_monday_of_timestamp(t: i64) -> i64 {
    let week_count = (t - FIRST_MONDAY_TIMESTAMP) / TOTAL_SECONDS_OF_A_WEEK;
    week_count * TOTAL_SECONDS_OF_A_WEEK + FIRST_MONDAY_TIMESTAMP
}

pub fn get_time_slots(start: i64, end: i64, schedules: Vec<i32>) -> Vec<(i64, i64)> {
    let mut monday_of_start = get_monday_of_timestamp(start);
    let monday_of_end = get_monday_of_timestamp(end) + 1;

    let start_schedules = schedules
        .iter()
        .enumerate()
        .filter(|(index, _)| index % 2 == 0)
        .map(|(_, i)| *i)
        .collect::<Vec<i32>>();
    let end_schedules = schedules
        .iter()
        .enumerate()
        .filter(|(index, _)| index % 2 == 1)
        .map(|(_, i)| *i)
        .collect::<Vec<i32>>();

    let mut result = vec![];
    while monday_of_start <= monday_of_end {
        for (index, start_schedule) in start_schedules.iter().enumerate() {
            let start_slot_at = monday_of_start + (*start_schedule as i64);
            let end_slot_at = monday_of_start + (end_schedules[index] as i64);
            if start_slot_at >= start && end_slot_at <= end {
                result.push((start_slot_at, end_slot_at));
            }
        }
        monday_of_start += TOTAL_SECONDS_OF_A_WEEK;
    }

    result
}

pub fn hash_pwd(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);
    Pbkdf2
        .hash_password_simple(password.as_ref(), salt.as_ref())
        .unwrap()
        .to_string()
}

pub fn check_pwd(hashed_password: &str, password: &str) -> bool {
    if let Ok(hash_data) = PasswordHash::new(hashed_password) {
        Pbkdf2
            .verify_password(password.as_ref(), &hash_data)
            .is_ok()
    } else {
        false
    }
}

pub fn is_pdf(mime_type: &str) -> bool {
    mime_type == "application/pdf"
}

pub fn is_ppt(mime_type: &str) -> bool {
    [
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]
    .contains(&mime_type)
}

pub fn is_doc(mime_type: &str) -> bool {
    [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    .contains(&mime_type)
}

pub fn is_excel(mime_type: &str) -> bool {
    [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    .contains(&mime_type)
}

pub fn is_video(mime_type: &str) -> bool {
    mime_type.contains("video/")
}

pub fn is_image(mime_type: &str) -> bool {
    mime_type.contains("image/")
}

pub fn is_document(mime_type: &str) -> bool {
    is_excel(mime_type)
        || is_ppt(mime_type)
        || is_doc(mime_type)
        || is_pdf(mime_type)
        || mime_type.contains("text")
}

const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ\
                            abcdefghijklmnopqrstuvwxyz\
                            0123456789";
const CODE_LEN: usize = 12;

pub fn generate_code() -> String {
    let mut rng = rand::thread_rng();

    (0..CODE_LEN)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

const OTP_CODE_CHARSET: &[u8] = b"0123456789";

pub fn generate_otp() -> String {
    let mut rng = rand::thread_rng();

    (0..6)
        .map(|_| {
            let idx = rng.gen_range(0..OTP_CODE_CHARSET.len());
            OTP_CODE_CHARSET[idx] as char
        })
        .collect()
}

pub fn is_local() -> bool {
    std::env::var("APP_ENV").map_or(false, |v| &v == "local")
}
