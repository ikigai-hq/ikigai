//! WARNING: Mem is purposing for testing or quick using. It doesn't support Persistent Job.
//! Don't use in production.
//! If you want to improve, feel free to contribute
use redis::Direction;
use std::collections::{HashMap, VecDeque};
use std::sync::{Arc, Mutex};

use crate::backend::Backend;
use crate::Error;

#[derive(Default)]
pub struct InMemory {
    pub queues: Arc<Mutex<HashMap<String, VecDeque<String>>>>,
    pub storages: Arc<Mutex<HashMap<String, HashMap<String, String>>>>,
}

fn insert_item_to_queue(queue: &mut VecDeque<String>, items: Vec<String>, direction: Direction) {
    for item in items {
        match direction {
            Direction::Left => queue.push_front(item.clone()),
            Direction::Right => queue.push_back(item.clone()),
        }
    }
}

impl Backend for InMemory {
    fn queue_push(&self, queue_name: &str, item: &str) -> Result<(), Error> {
        let mut queues = self.queues.lock().unwrap();
        if let Some(queue) = queues.get_mut(queue_name) {
            queue.push_back(item.to_string());
        } else {
            let items = VecDeque::from([item.to_string()]);
            queues.insert(queue_name.to_string(), items);
        }
        Ok(())
    }

    // Direction::Left => Head, Direction::Right => Tail
    fn queue_move(
        &self,
        from_queue: &str,
        to_queue: &str,
        count: usize,
        from_direction: Direction,
        to_direction: Direction,
    ) -> Result<Vec<String>, Error> {
        let mut queues = self.queues.lock().unwrap();
        let mut moving_items = vec![];
        if let Some(from_queue) = queues.get_mut(from_queue) {
            for _ in 0..count {
                let item = match from_direction {
                    Direction::Left => from_queue.pop_front(),
                    Direction::Right => from_queue.pop_back(),
                };
                if let Some(item) = item {
                    moving_items.push(item);
                }
            }
        }

        if let Some(to_queue) = queues.get_mut(to_queue) {
            insert_item_to_queue(to_queue, moving_items.clone(), to_direction);
        } else {
            let mut items = VecDeque::new();
            insert_item_to_queue(&mut items, moving_items.clone(), to_direction);
            queues.insert(to_queue.to_string(), items);
        }

        Ok(moving_items)
    }

    fn queue_get(&self, queue: &str, count: usize) -> Result<Vec<String>, Error> {
        let mut items = vec![];
        if let Some(queue) = self.queues.lock().unwrap().get(queue) {
            for _ in 0..count {
                if let Some(item) = queue.back() {
                    items.push(item.to_string());
                }
            }
        }

        Ok(items)
    }

    fn queue_count(&self, queue: &str) -> Result<usize, Error> {
        if let Some(queue) = self.queues.lock().unwrap().get(queue) {
            Ok(queue.len())
        } else {
            Ok(0)
        }
    }

    fn storage_upsert(&self, hash: &str, key: &str, value: String) -> Result<(), Error> {
        let mut storages = self.storages.lock().unwrap();
        if let Some(storage) = storages.get_mut(hash) {
            storage.insert(key.to_string(), value);
        } else {
            let mut inner_storage = HashMap::new();
            inner_storage.insert(key.to_string(), value);
            storages.insert(hash.to_string(), inner_storage);
        }
        Ok(())
    }

    fn storage_get(&self, hash: &str, key: &str) -> Result<Option<String>, Error> {
        let storages = self.storages.lock().unwrap();
        if let Some(storage) = storages.get(hash) {
            Ok(storage.get(key).cloned())
        } else {
            Ok(None)
        }
    }
}
