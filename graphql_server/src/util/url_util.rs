use uuid::Uuid;

pub fn get_base_url() -> String {
    std::env::var("APP_URL").unwrap_or("http://localhost:3000".to_string())
}

pub fn format_document_magic_link(document_id: Uuid, otp: &str, user_id: i32) -> String {
    let base_url = get_base_url();
    format!("{base_url}/documents/{document_id}?otp={otp}&user_id={user_id}")
}

pub fn format_document_url(document_id: Uuid) -> String {
    let base_url = get_base_url();
    format!("{base_url}/documents/{document_id}")
}

pub fn format_space_url(space_id: i32) -> String {
    let base_url = get_base_url();
    format!("{base_url}/spaces/{space_id}")
}

pub fn format_start_space_magic_link(space_id: i32, otp: &str, user_id: i32) -> String {
    let base_url = get_base_url();
    format!("{base_url}/spaces/{space_id}/start?otp={otp}&user_id={user_id}")
}
