use redis::{Client, Commands, Direction, IntoConnectionInfo, RedisResult};

use crate::types::{Backend, QueueDirection};
use crate::Error;

#[derive(Debug, Clone)]
pub struct Redis {
    client: Client,
}

impl Redis {
    /// Redis::new("redis://localhost:6379/");
    pub fn new<T: IntoConnectionInfo>(connection_params: T) -> Self {
        let client = Client::open(connection_params).unwrap();
        Self { client }
    }

    pub fn lpush(&self, queue_name: &str, item: &str) -> RedisResult<()> {
        let mut conn = self.client.get_connection()?;
        conn.lpush(queue_name, item)?;
        Ok(())
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

impl Backend for Redis {
    fn queue_push(&self, queue_name: &str, item: &str) -> Result<(), Error> {
        self.lpush(queue_name, item)?;
        Ok(())
    }

    fn queue_move(
        &self,
        from_queue: &str,
        to_queue: &str,
        count: usize,
        from_position: QueueDirection,
        to_position: QueueDirection,
    ) -> Result<Vec<String>, Error> {
        let from_direction = from_position.into();
        let to_direction = to_position.into();
        let res = self.lmove(from_queue, to_queue, count, from_direction, to_direction)?;
        Ok(res)
    }

    fn queue_get(&self, queue: &str, count: usize) -> Result<Vec<String>, Error> {
        let res = self.lrange(queue, count)?;
        Ok(res)
    }

    fn queue_count(&self, queue: &str) -> Result<usize, Error> {
        let res = self.llen(queue)?;
        Ok(res)
    }

    fn storage_upsert(&self, hash: &str, key: &str, value: String) -> Result<(), Error> {
        let mut conn = self.client.get_connection()?;
        conn.hset(hash, key, value)?;
        Ok(())
    }

    fn storage_get(&self, hash: &str, key: &str) -> Result<Option<String>, Error> {
        let mut conn = self.client.get_connection()?;
        let res: Option<String> = conn.hget(hash, key)?;
        Ok(res)
    }
}

impl From<QueueDirection> for Direction {
    fn from(value: QueueDirection) -> Self {
        match value {
            QueueDirection::Front => Direction::Left,
            QueueDirection::Back => Direction::Right,
        }
    }
}

fn clone_direction(direction: &Direction) -> Direction {
    match direction {
        Direction::Left => Direction::Left,
        Direction::Right => Direction::Right,
    }
}
