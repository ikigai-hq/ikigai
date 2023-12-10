use redis::{Client, Commands, Direction, IntoConnectionInfo, RedisResult};
use serde::de::DeserializeOwned;
use serde::Serialize;

#[derive(Debug, Clone)]
pub struct Redis {
    client: Client,
}

impl Redis {
    /// Example: Redis::new("redis://localhost:6379/");
    pub fn new<T: IntoConnectionInfo>(connection_params: T) -> Self {
        let client = Client::open(connection_params).unwrap();
        Self { client }
    }

    pub fn lpush(&self, queue_name: &str, item: &str) -> RedisResult<()> {
        let mut conn = self.client.get_connection()?;
        conn.lpush(queue_name, item)?;
        Ok(())
    }

    pub fn hash_upsert<T: Serialize>(&self, hash: &str, key: &str, value: T) -> RedisResult<()> {
        let mut conn = self.client.get_connection()?;
        let value = serde_json::to_string(&value).unwrap_or("".into());
        conn.hset(hash, key, value)?;
        Ok(())
    }

    pub fn hash_get<T: DeserializeOwned>(&self, hash: &str, key: &str) -> RedisResult<Option<T>> {
        let mut conn = self.client.get_connection()?;
        let res: RedisResult<Option<String>> = conn.hget(hash, key);
        let value = match res {
            Ok(Some(item)) => serde_json::from_str(&item).ok(),
            _ => None,
        };
        Ok(value)
    }

    pub fn lmove(
        &self,
        from_queue: &str,
        to_queue: &str,
        count: usize,
        from_direction: Direction,
        to_direction: Direction,
    ) -> RedisResult<Vec<String>> {
        let mut conn = self.client.get_connection()?;
        let mut items = vec![];
        for _ in 0..count {
            let result: Option<String> = conn.lmove(
                from_queue,
                to_queue,
                clone_direction(&from_direction),
                clone_direction(&to_direction),
            )?;

            if let Some(item) = result {
                items.push(item)
            }
        }

        Ok(items)
    }

    pub fn lrange(&self, queue: &str, count: usize) -> RedisResult<Vec<String>> {
        let mut conn = self.client.get_connection()?;
        let items = conn.lrange(queue, 0, count as isize - 1)?;
        Ok(items)
    }

    pub fn llen(&self, queue: &str) -> RedisResult<usize> {
        let mut conn = self.client.get_connection()?;
        conn.llen(queue)
    }
}

fn clone_direction(direction: &Direction) -> Direction {
    match direction {
        Direction::Left => Direction::Left,
        Direction::Right => Direction::Right,
    }
}
