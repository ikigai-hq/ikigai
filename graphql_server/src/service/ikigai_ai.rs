use reqwest::Client;

use crate::db::QuizType;
use crate::error::IkigaiError;

pub struct IkigaiAI;

#[derive(Debug, Clone, InputObject, Serialize)]
pub struct GenerateQuizzesRequestData {
    pub user_context: String,
    pub subject: String,
    pub total_quizzes: i32,
}

// Single Choice
#[derive(Debug, Clone, SimpleObject, InputObject, Deserialize, Serialize)]
#[graphql(input_name = "AISingleChoiceQuizInput")]
pub struct AISingleChoiceQuiz {
    pub question: String,
    pub answers: Vec<String>,
    pub correct_answer: String,
}

#[derive(Debug, Clone, SimpleObject, InputObject, Deserialize, Serialize)]
#[graphql(input_name = "AISingleChoiceResponseDataInput")]
pub struct AISingleChoiceResponseData {
    #[graphql(skip_input)]
    pub subject: String,
    pub quizzes: Vec<AISingleChoiceQuiz>,
}

// Multiple Choice
#[derive(Debug, Clone, SimpleObject, InputObject, Deserialize, Serialize)]
#[graphql(input_name = "AISMultipleChoiceQuizInput")]
pub struct AIMultipleChoiceQuiz {
    pub question: String,
    pub answers: Vec<String>,
    pub correct_answers: Vec<String>,
}

#[derive(Debug, Clone, SimpleObject, InputObject, Deserialize, Serialize)]
#[graphql(input_name = "AIMultipleChoiceResponseDataInput")]
pub struct AIMultipleChoiceResponseData {
    #[graphql(skip_input)]
    pub subject: String,
    pub quizzes: Vec<AIMultipleChoiceQuiz>,
}

// Fill in Blank
#[derive(Debug, Clone, SimpleObject, InputObject, Deserialize, Serialize)]
#[graphql(input_name = "AIFillInBlankQuizInput")]
pub struct AIFillInBlankQuiz {
    #[graphql(skip_input)]
    pub position: i32,
    pub correct_answer: String,
}

#[derive(Debug, Clone, SimpleObject, InputObject, Deserialize, Serialize)]
#[graphql(input_name = "AIGenerateQuizResponseDataInput")]
pub struct AIFillInBlankResponseData {
    #[graphql(skip_input)]
    pub content: String,
    pub quizzes: Vec<AIFillInBlankQuiz>,
}

// Select Option
#[derive(Debug, Clone, SimpleObject, InputObject, Deserialize, Serialize)]
#[graphql(input_name = "AISelectOptionInput")]
pub struct AISelectOptionQuiz {
    #[graphql(skip_input)]
    pub position: i32,
    pub answers: Vec<String>,
    pub correct_answer: String,
}

#[derive(Debug, Clone, SimpleObject, InputObject, Deserialize, Serialize)]
#[graphql(input_name = "AIGenerateQuizResponseDataInput")]
pub struct AISelectOptionsResponseData {
    #[graphql(skip_input)]
    pub content: String,
    pub quizzes: Vec<AISelectOptionQuiz>,
}

#[derive(Debug, Clone, SimpleObject, InputObject, Deserialize, Serialize)]
#[graphql(input_name = "AIGenerateQuizResponseInput")]
pub struct AIGenerateQuizResponse {
    pub quiz_type: QuizType,
    pub single_choice_data: Option<AISingleChoiceResponseData>,
    pub multiple_choice_data: Option<AIMultipleChoiceResponseData>,
    pub fill_in_blank_data: Option<AIFillInBlankResponseData>,
    pub select_options_data: Option<AISelectOptionsResponseData>,
}

impl IkigaiAI {
    fn get_url() -> String {
        std::env::var("IKIGAI_AI_HOST").unwrap_or("http://localhost:8001".into())
    }

    pub async fn generate_single_choice_quizzes(
        data: &GenerateQuizzesRequestData,
    ) -> Result<AIGenerateQuizResponse, IkigaiError> {
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
    ) -> Result<AIGenerateQuizResponse, IkigaiError> {
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

    pub async fn generate_fill_in_blank(
        data: &GenerateQuizzesRequestData,
    ) -> Result<AIGenerateQuizResponse, IkigaiError> {
        let base_url = Self::get_url();
        let url = format!("{base_url}/quizzes/generate-fill-in-blank");
        let res = Client::new()
            .post(url)
            .json(data)
            .send()
            .await?
            .json()
            .await?;

        Ok(res)
    }

    pub async fn generate_select_options(
        data: &GenerateQuizzesRequestData,
    ) -> Result<AIGenerateQuizResponse, IkigaiError> {
        let base_url = Self::get_url();
        let url = format!("{base_url}/quizzes/generate-select-options");
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
