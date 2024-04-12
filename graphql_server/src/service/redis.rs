use redis::{Client, Commands, RedisResult};

fn format_reset_pwd_key(user_id: i32) -> String {
    format!("{user_id}:reset_pwd")
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

    pub fn set_value(&self, key: &str, value: &str, ttl_seconds: Option<usize>) -> RedisResult<()> {
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

    pub fn set_reset_pwd_otp(&self, user_id: i32, otp: &str) -> RedisResult<()> {
        let key = format_reset_pwd_key(user_id);
        // Valid token in 5 mins
        self.set_value(&key, otp, Some(300))?;
        Ok(())
    }

    pub fn get_reset_pwd_otp(&self, user_id: i32) -> RedisResult<String> {
        let key = format_reset_pwd_key(user_id);
        self.get_value(&key)
    }

    pub fn del_reset_pwd_otp(&self, user_id: i32) -> RedisResult<()> {
        let key = format_reset_pwd_key(user_id);
        self.del_value(&key)
    }
}
