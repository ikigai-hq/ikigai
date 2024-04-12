use async_graphql::Result;
use uuid::Uuid;

use crate::authentication_token::Claims;
use crate::db::*;
use crate::error::OpenExamErrorExt;
use crate::util::get_now_as_secs;

pub fn org_url(org: &Organization) -> String {
    org.get_org_url_address()
}

pub fn class_url(org: &Organization, class_id: i32) -> String {
    let org_url = org_url(org);
    format!("{org_url}classes/{class_id}")
}

pub fn announcement_url(org: &Organization, class_id: i32, announcement_id: i32) -> String {
    let class_url = class_url(org, class_id);
    format!("{class_url}?announcement-id={announcement_id}")
}

pub fn document_url(org: &Organization, document_id: Uuid) -> String {
    let org_url = org_url(org);
    format!("{org_url}documents/{document_id}")
}

pub fn billing_url(org: &Organization) -> String {
    let org_url = org_url(org);
    format!("{org_url}organization?tab=Plan")
}

pub fn get_user_class_calendar_url(
    org: &Organization,
    class_id: i32,
    user_id: i32,
) -> Result<String> {
    let token = get_access_token_for_calendar(user_id)?;
    let org_url = org_url(org);
    Ok(format!(
        "{org_url}classes/embed/{class_id}?accessToken={token}"
    ))
}

pub fn get_access_token_for_calendar(user_id: i32) -> Result<String> {
    let ttl = get_now_as_secs() + 3600 * 24 * 8; // 1 week + 1 day
    Claims::new_with_ttl(user_id, ttl as usize)
        .encode()
        .format_err()
}
