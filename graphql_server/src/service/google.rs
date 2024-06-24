use crate::error::IkigaiError;

#[derive(Debug, Clone, Deserialize)]
pub struct IdToken {
    pub email: String,
    pub name: String,
}

pub async fn verify_google_id_token(id_token: &str) -> Result<IdToken, IkigaiError> {
    let url = format!("https://oauth2.googleapis.com/tokeninfo?id_token={id_token}");
    let res = reqwest::Client::new().get(url).send().await?.json().await?;
    Ok(res)
}
