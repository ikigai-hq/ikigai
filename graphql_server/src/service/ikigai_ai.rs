use reqwest::Client;

use crate::error::IkigaiError;

pub struct IkigaiAI;

#[derive(Debug, Clone, InputObject, Serialize)]
pub struct GenerateQuizzesRequestData {
    pub user_context: String,
    pub subject: String,
    pub total_quizzes: i32,
}

#[derive(Debug, Clone, SimpleObject, Deserialize, Serialize)]
#[graphql(complex)]
pub struct AIQuizResponse {
    pub question: String,
    pub answers: Vec<String>,
    pub correct_answer: Option<String>,
    pub correct_answers: Option<Vec<String>>,
}

#[derive(Debug, Clone, SimpleObject, Deserialize, Serialize)]
pub struct AIQuizzesResponse {
    pub subject: String,
    pub quizzes: Vec<AIQuizResponse>,
}

impl IkigaiAI {
    fn get_url() -> String {
        std::env::var("IKIGAI_AI_HOST").unwrap_or("http://localhost:8001".into())
    }

    pub async fn generate_single_choice_quizzes(
        data: &GenerateQuizzesRequestData,
    ) -> Result<AIQuizzesResponse, IkigaiError> {
        let base_url = Self::get_url();
        let url = format!("{base_url}/quizzes/generate-single-choice");
        let res = Client::new()
            .post(url)
            .json(data)
            .send()
            .await?
            .json()
            .await?;

        Ok(res)
    }

    pub async fn generate_multiple_choice_quizzes(
        data: &GenerateQuizzesRequestData,
    ) -> Result<AIQuizzesResponse, IkigaiError> {
        let base_url = Self::get_url();
        let url = format!("{base_url}/quizzes/generate-multiple-choice");
        let res = Client::new()
            .post(url)
            .json(data)
            .send()
            .await?
            .json()
            .await?;

        Ok(res)
    }
}
