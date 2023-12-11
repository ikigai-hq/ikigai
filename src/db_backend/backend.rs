#![allow(clippy::borrowed_box)]
use redis::Direction;
use serde::de::DeserializeOwned;
use serde::Serialize;

use crate::Error;

pub trait Backend {
    fn queue_push(&self, queue_name: &str, item: &str) -> Result<(), Error>;

    fn queue_move(
        &self,
        from_queue: &str,
        to_queue: &str,
        count: usize,
        from_direction: Direction,
        to_direction: Direction,
    ) -> Result<Vec<String>, Error>;

    fn queue_get(&self, queue: &str, count: usize) -> Result<Vec<String>, Error>;

    fn queue_count(&self, queue: &str) -> Result<usize, Error>;

    fn storage_upsert(&self, hash: &str, key: &str, value: String) -> Result<(), Error>;

    fn storage_get(&self, hash: &str, key: &str) -> Result<Option<String>, Error>;
}

pub fn storage_upsert<T: Serialize>(
    backend: &Box<dyn Backend>,
    hash: &str,
    key: &str,
    value: T,
) -> Result<(), Error> {
    let value = serde_json::to_string(&value).unwrap_or("".into());
    backend.storage_upsert(hash, key, value)
}

pub fn storage_get<T: DeserializeOwned>(
    backend: &Box<dyn Backend>,
    hash: &str,
    key: &str,
) -> Result<Option<T>, Error> {
    let value = backend.storage_get(hash, key).ok().flatten();
    let item = match value {
        Some(value) => serde_json::from_str(&value).ok(),
        _ => None,
    };
    Ok(item)
}
