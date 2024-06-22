use redis::RedisError;

#[derive(Debug)]
pub enum Error {
    Redis(RedisError),
    ExecutionError(String),
    CronError(cron::error::Error),
}

impl From<RedisError> for Error {
    fn from(value: RedisError) -> Self {
        Self::Redis(value)
    }
}

impl From<cron::error::Error> for Error {
    fn from(value: cron::error::Error) -> Self {
        Self::CronError(value)
    }
}
