use redis::{Client, Commands, RedisResult};

fn format_magic_token(user_id: i32) -> String {
    format!("users:magic_token:{user_id}")
}

#[derive(Debug, Clone)]
pub struct Redis {
    client: Client,
}

impl Redis {
    pub fn init() -> Self {
        let url = std::env::var("REDIS_URL").unwrap();
        let client = Client::open(url).unwrap();
        Self { client }
    }

    pub fn set_value(&self, key: &str, value: &str, ttl_seconds: Option<i64>) -> RedisResult<()> {
        let mut conn = self.client.get_connection()?;

        conn.set(key, value)?;
        if let Some(ttl) = ttl_seconds {
            conn.expire(key, ttl)?;
        }

        Ok(())
    }

    fn get_value(&self, key: &str) -> RedisResult<String> {
        let mut conn = self.client.get_connection()?;
        let otp = conn.get(key)?;
        Ok(otp)
    }

    fn del_value(&self, key: &str) -> RedisResult<()> {
        let mut conn = self.client.get_connection()?;
        conn.del(key)?;
        Ok(())
    }

    pub fn set_magic_token(&self, user_id: i32, otp: &str) -> RedisResult<()> {
        let key = format_magic_token(user_id);
        self.set_value(&key, otp, Some(600))?;
        Ok(())
    }

    pub fn get_magic_token(&self, user_id: i32) -> RedisResult<String> {
        let key = format_magic_token(user_id);
        self.get_value(&key)
    }

    pub fn del_magic_token(&self, user_id: i32) -> RedisResult<()> {
        let key = format_magic_token(user_id);
        self.del_value(&key)
    }
}
