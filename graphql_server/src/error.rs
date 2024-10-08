use aj::JobBuilderError;
use async_graphql::ErrorExtensions;
use aws_sdk_s3::types::SdkError;
use diesel::result::Error as DBError;
use hmac::crypto_mac::InvalidKeyLength;
use jsonwebtoken::errors::Error as JWTError;
use lettre::address::AddressError;

#[derive(Debug, Error, Clone)]
#[error(transparent)]
pub enum IkigaiError {
    #[error("error.not_found")]
    NotFound,
    #[error("error.unauthorized")]
    Unauthorized { message: String },
    #[error("error.bad_request")]
    BadRequest { message: String },
    #[error("error.internal_server_error")]
    InternalServerError,
}

impl IkigaiError {
    pub fn message(&self) -> &str {
        match self {
            Self::NotFound => "Item doesn't exists",
            Self::BadRequest { message } => message,
            Self::Unauthorized { message } => message,
            Self::InternalServerError => "Internal Server Error",
        }
    }

    pub fn code(&self) -> i32 {
        match self {
            Self::NotFound => 404,
            Self::BadRequest { .. } => 400,
            Self::Unauthorized { .. } => 401,
            Self::InternalServerError => 500,
        }
    }

    pub fn new_unauthorized(message: impl Into<String>) -> Self {
        Self::Unauthorized {
            message: message.into(),
        }
    }

    pub fn new_bad_request(message: impl Into<String>) -> Self {
        Self::BadRequest {
            message: message.into(),
        }
    }
}

impl ErrorExtensions for IkigaiError {
    fn extend(&self) -> async_graphql::Error {
        async_graphql::Error::new(self.message()).extend_with(|_, e| e.set("code", self.code()))
    }
}

pub trait IkigaiErrorExt<T>
where
    Self: Sized,
{
    fn map_local_err(self) -> Result<T, IkigaiError>;

    fn format_err(self) -> Result<T, async_graphql::Error> {
        self.map_local_err().map_err(|e| e.extend())
    }
}

impl<T, E: Into<IkigaiError>> IkigaiErrorExt<T> for Result<T, E> {
    fn map_local_err(self) -> Result<T, IkigaiError> {
        self.map_err(|e| e.into())
    }
}

impl From<DBError> for IkigaiError {
    fn from(e: DBError) -> Self {
        error!("Database Error {:?}", e);
        match e {
            DBError::NotFound => Self::NotFound,
            _ => Self::InternalServerError,
        }
    }
}

impl From<JWTError> for IkigaiError {
    fn from(e: JWTError) -> Self {
        error!("JWT Error {:?}", e);
        Self::new_unauthorized("Your access token is incorrect!")
    }
}

impl From<InvalidKeyLength> for IkigaiError {
    fn from(_: InvalidKeyLength) -> Self {
        error!("Cannot create new hasher from slice");
        Self::new_unauthorized("Your access token is incorrect!")
    }
}

impl From<reqwest::Error> for IkigaiError {
    fn from(e: reqwest::Error) -> Self {
        error!("Cannot send http request to another host {:?}", e);
        Self::InternalServerError
    }
}

impl From<simple_aws_s3::error::Error> for IkigaiError {
    fn from(e: simple_aws_s3::error::Error) -> Self {
        error!("Cannot execute request to S3 {:?}", e);
        Self::InternalServerError
    }
}

impl From<actix::MailboxError> for IkigaiError {
    fn from(e: actix::MailboxError) -> Self {
        error!("Mailbox is closed {:?}", e);
        Self::InternalServerError
    }
}

impl From<aws_sdk_s3::Error> for IkigaiError {
    fn from(e: aws_sdk_s3::Error) -> Self {
        error!("AWS SDK Error: {:?}", e);
        Self::InternalServerError
    }
}

impl<E: std::fmt::Debug> From<SdkError<E>> for IkigaiError {
    fn from(e: SdkError<E>) -> Self {
        error!("AWS SDK Error: {:?}", e);
        Self::InternalServerError
    }
}

impl From<anyhow::Error> for IkigaiError {
    fn from(e: anyhow::Error) -> Self {
        error!("Any How Error: {:?}", e);
        Self::InternalServerError
    }
}

impl From<aws_sdk_s3::presigning::config::Error> for IkigaiError {
    fn from(e: aws_sdk_s3::presigning::config::Error) -> Self {
        error!("Presigned Config Fail: {:?}", e);
        Self::InternalServerError
    }
}

impl From<AddressError> for IkigaiError {
    fn from(e: AddressError) -> Self {
        error!("Parse Address Error: {:?}", e);
        Self::InternalServerError
    }
}

impl From<lettre::error::Error> for IkigaiError {
    fn from(e: lettre::error::Error) -> Self {
        error!("Send Email Error: {:?}", e);
        Self::InternalServerError
    }
}

impl From<serde_json::Error> for IkigaiError {
    fn from(e: serde_json::Error) -> Self {
        error!("Serde Error: {:?}", e);
        Self::InternalServerError
    }
}

impl From<tera::Error> for IkigaiError {
    fn from(e: tera::Error) -> Self {
        error!("Tera Error: {:?}", e);
        Self::InternalServerError
    }
}

impl From<redis::RedisError> for IkigaiError {
    fn from(e: redis::RedisError) -> Self {
        error!("Redis error: {:?}", e);
        Self::InternalServerError
    }
}

impl From<r2d2::Error> for IkigaiError {
    fn from(e: r2d2::Error) -> Self {
        error!("R2D2 error: {:?}", e);
        Self::InternalServerError
    }
}

impl From<std::io::Error> for IkigaiError {
    fn from(e: std::io::Error) -> Self {
        error!("IO Error: {:?}", e);
        Self::InternalServerError
    }
}

impl From<JobBuilderError> for IkigaiError {
    fn from(e: JobBuilderError) -> Self {
        error!("Builder Error: {:?}", e);
        Self::InternalServerError
    }
}
