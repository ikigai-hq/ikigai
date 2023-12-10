use actix::*;
use lazy_static::lazy_static;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::any::{Any, TypeId};
use std::collections::HashMap;
use std::sync::Mutex;

use crate::job::Job;
use crate::queue::{cancel_job, enqueue_job, WorkQueue};
use crate::redis::Redis;

lazy_static! {
    static ref QUEUE_REGISTRY: Mutex<Registry> = Mutex::new(Registry::default());
}

#[derive(Debug, Default)]
pub struct Registry {
    registry: HashMap<TypeId, Box<dyn Any + Send>>,
    registry_by_name: HashMap<String, Box<dyn Any + Send>>,
}

#[derive(Default)]
pub struct Worker;

impl Actor for Worker {
    type Context = Context<Self>;
}

impl Worker {
    pub fn register<M>(queue_name: &str, backend: Redis)
    where
        M: Message + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,
        M::Result: Send,
        WorkQueue<M>: Actor<Context = Context<WorkQueue<M>>> + Handler<M>,
    {
        let type_id = TypeId::of::<M>();

        let mut registry = QUEUE_REGISTRY.lock().unwrap();
        if registry.registry_by_name.contains_key(queue_name) {
            panic!("You already register queue with name: {}", queue_name);
        }
        if registry.registry.contains_key(&type_id) {
            panic!("You already register queue with type: {:?}", type_id);
        }

        // Start Queue in an arbiter thread
        let queue_addr = WorkQueue::<M>::start_with_name(queue_name.into(), backend);
        registry
            .registry
            .insert(type_id, Box::new(queue_addr.clone()));
        registry
            .registry_by_name
            .insert(queue_name.into(), Box::new(queue_addr));
    }

    pub fn get_queue_address<M>() -> Option<Addr<WorkQueue<M>>>
    where
        M: Message + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,
        M::Result: Send,
        WorkQueue<M>: Actor<Context = Context<WorkQueue<M>>> + Handler<M>,
    {
        let type_id = TypeId::of::<M>();
        if let Some(queue_addr) = QUEUE_REGISTRY.lock().unwrap().registry.get(&type_id) {
            if let Some(addr) = queue_addr.downcast_ref::<Addr<WorkQueue<M>>>() {
                return Some(addr.clone());
            }
        }

        None
    }

    pub fn enqueue_job<M>(job: Job<M>, re_run: bool) -> bool
    where
        M: Message + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,
        M::Result: Send,
        WorkQueue<M>: Actor<Context = Context<WorkQueue<M>>> + Handler<M>,
    {
        let addr: Option<Addr<WorkQueue<M>>> = Worker::get_queue_address();
        if let Some(queue_addr) = addr {
            enqueue_job(queue_addr, job, re_run);
            true
        } else {
            false
        }
    }

    pub fn cancel_job<M>(job_id: String) -> bool
    where
        M: Message + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,
        M::Result: Send,
        WorkQueue<M>: Actor<Context = Context<WorkQueue<M>>> + Handler<M>,
    {
        let addr: Option<Addr<WorkQueue<M>>> = Worker::get_queue_address();
        if let Some(queue_addr) = addr {
            cancel_job(queue_addr, job_id);
            true
        } else {
            false
        }
    }

    pub fn add_job<M>(job: Job<M>) -> bool
    where
        M: Message + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,
        M::Result: Send,
        WorkQueue<M>: Actor<Context = Context<WorkQueue<M>>> + Handler<M>,
    {
        Self::enqueue_job(job, false)
    }

    pub fn add_job_and_rerun<M>(job: Job<M>) -> bool
    where
        M: Message + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,
        M::Result: Send,
        WorkQueue<M>: Actor<Context = Context<WorkQueue<M>>> + Handler<M>,
    {
        Self::enqueue_job(job, true)
    }
}
