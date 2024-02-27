use redis::RedisError;

#[derive(Debug)]
pub enum Error {
    Redis(RedisError),
    ExecutionError(String),
}

impl From<RedisError> for Error {
    fn from(value: RedisError) -> Self {
        Self::Redis(value)
    }
}
