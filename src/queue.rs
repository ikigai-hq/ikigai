use actix::fut::wrap_future;
use actix::*;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::fmt::Debug;
use std::marker::PhantomData;
use std::time::Duration;

use crate::job::{Job, JobStatus};
use crate::types::{get_from_storage, upsert_to_storage, Backend};
use crate::{Error, Executable};

const DEFAULT_TICK_DURATION: Duration = Duration::from_millis(10);
const JOBS_PER_TICK: usize = 5;

#[derive(Debug, Clone)]
pub struct WorkQueueConfig {
    pub process_tick_duration: Duration,
    pub job_per_ticks: usize,
}

impl WorkQueueConfig {
    pub fn init() -> Self {
        Self {
            job_per_ticks: JOBS_PER_TICK,
            process_tick_duration: DEFAULT_TICK_DURATION,
        }
    }
}

impl Default for WorkQueueConfig {
    fn default() -> Self {
        Self::init()
    }
}

pub struct WorkQueue<M>
where
    M: Executable + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,
    Self: Actor<Context = Context<Self>>,
{
    pub job_name: String,
    config: WorkQueueConfig,
    _type: PhantomData<M>,
    backend: Box<dyn Backend>,
}

impl<M> Actor for WorkQueue<M>
where
    M: Executable + Unpin + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,
{
    type Context = Context<Self>;
}

impl<M> WorkQueue<M>
where
    M: Executable + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,
    Self: Actor<Context = Context<Self>>,
{
    pub fn new(job_name: String, backend: impl Backend + 'static) -> Self {
        Self {
            job_name,
            config: WorkQueueConfig::default(),
            _type: PhantomData,
            backend: Box::new(backend),
        }
    }

    pub fn format_queue_name(&self, status: JobStatus) -> String {
        format!("{}:queue:{:?}", self.job_name, status)
    }

    pub fn format_failed_queue_name(&self) -> String {
        format!("{}:queue:failed", self.job_name)
    }

    pub fn storage_name(&self) -> String {
        format!("{}:storage", self.job_name)
    }

    pub fn start_with_name(name: String, backend: impl Backend + Send + 'static) -> Addr<Self> {
        let arbiter = Arbiter::new();

        <Self as Actor>::start_in_arbiter(&arbiter.handle(), |ctx| {
            let mut q = WorkQueue::<M>::new(name, backend);
            q.process_jobs(ctx);
            q
        })
    }

    pub fn enqueue_with_config(&self, job: Job<M>, re_run: bool) -> Result<(), Error> {
        let key = job.id.clone();
        if let Some(existing_job) =
            get_from_storage::<Job<M>>(&self.backend, &self.storage_name(), &key)?
        {
            if !existing_job.is_done() {
                info!("Update exising job with new information: {}", job.id);
                upsert_to_storage(&self.backend, &self.storage_name(), &key, &job)?;
                return Ok(());
            }

            if re_run {
                info!("Job {} is completed but trigger re run", existing_job.id);
                self.enqueue(job)?;
                return Ok(());
            }

            warn!(
                "Job {} is existing but not match any action, skip!",
                existing_job.id
            );
            return Ok(());
        }

        self.enqueue(job)
    }

    pub fn enqueue(&self, mut job: Job<M>) -> Result<(), Error> {
        let key = job.id.clone();
        info!("Enqueue {}", key);
        self.backend
            .queue_push(&self.format_queue_name(JobStatus::Queued), &key)?;
        job.enqueue();
        upsert_to_storage(&self.backend, &self.storage_name(), &key, &job)?;
        Ok(())
    }

    pub fn re_enqueue(&self, mut job: Job<M>) -> Result<(), Error> {
        debug!("Re Enqueue job {}", job.id);
        if job.is_cancelled() {
            error!("[WorkQueue] Cannot re enqueue canceled job {}", job.id);
            return Ok(());
        }

        job.job_status = JobStatus::Queued;
        upsert_to_storage(&self.backend, &self.storage_name(), &job.id, &job)?;

        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let queued_queue = self.format_queue_name(JobStatus::Queued);
        if let Err(e) = self
            .backend
            .queue_move_front_to_front(&processing_queue, &queued_queue, 1)
        {
            error!("[WorkQueue] Cannot re enqueue {}: {:?}", job.id, e);
        };
        Ok(())
    }

    pub fn cancel_current_job(&self, job: Job<M>) {
        info!("Cancel job {}", job.id);
        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let cancelled_queue = self.format_queue_name(JobStatus::Canceled);
        if let Err(e) =
            self.backend
                .queue_move_front_to_front(&processing_queue, &cancelled_queue, 1)
        {
            error!("[WorkQueue] Cannot re enqueue {}: {:?}", job.id, e);
        };
    }

    pub fn finish_current_job(&self, mut job: Job<M>) -> Result<(), Error> {
        info!("Finish job {}", job.id);
        job.finish();
        upsert_to_storage(&self.backend, &self.storage_name(), &job.id, &job)?;

        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let finished_queue = self.format_queue_name(JobStatus::Finished);
        if let Err(e) =
            self.backend
                .queue_move_front_to_front(&processing_queue, &finished_queue, 1)
        {
            error!("[WorkQueue] Cannot finish {}: {:?}", job.id, e);
        };
        Ok(())
    }

    pub fn move_current_job_to_failed(&self, job_id: &str) {
        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let failed_queue = self.format_failed_queue_name();
        if let Err(e) = self
            .backend
            .queue_move_front_to_front(&processing_queue, &failed_queue, 1)
        {
            error!(
                "[WorkQueue] Cannot move to failed queue {}: {:?}",
                job_id, e
            );
        };
    }

    pub fn get_fist_processing_job_id(&self) -> Result<Option<String>, Error> {
        let processing_queue_name = self.format_queue_name(JobStatus::Processing);
        let mut job_ids = self.backend.queue_get(&processing_queue_name, 1)?;
        if job_ids.is_empty() {
            return Ok(None);
        }

        Ok(Some(job_ids.remove(0)))
    }

    pub fn read_job(&self, job_id: &str) -> Result<Option<Job<M>>, Error> {
        let storage_name = self.storage_name();

        let item = get_from_storage(&self.backend, &storage_name, job_id)?;
        Ok(item)
    }

    // This logic will pick job from queued jobs -> processing jobs
    pub fn process_jobs(&mut self, ctx: &mut Context<WorkQueue<M>>) {
        self._pick_queued_job();
        self._process_processing_jobs(ctx.address());
        ctx.run_later(self.config.process_tick_duration, |work_queue, ctx| {
            work_queue.process_jobs(ctx);
        });
    }

    pub fn _pick_queued_job(&self) {
        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let total_processing_jobs = self.backend.queue_count(&processing_queue).unwrap_or(0);
        if total_processing_jobs > 0 {
            // There
            return;
        }

        // No job in processing queue, should import queued jobs to processing
        if let Err(err) = self.pick_queued_job(self.config.job_per_ticks) {
            error!(
                "[WorkQueue]: Cannot pick queued jobs of {} :{:?}",
                processing_queue, err
            );
        }
    }

    pub fn pick_queued_job(&self, count: usize) -> Result<Vec<String>, Error> {
        let idle_queue_name = self.format_queue_name(JobStatus::Queued);
        let processing_queue_name = self.format_queue_name(JobStatus::Processing);
        let job_ids = self.backend.queue_move_back_to_front(
            &idle_queue_name,
            &processing_queue_name,
            count,
        )?;

        let storage_name = self.storage_name();
        for job_id in &job_ids {
            if let Ok(Some(mut item)) =
                get_from_storage::<Job<M>>(&self.backend, &storage_name, job_id)
            {
                if item.job_status != JobStatus::Canceled {
                    item.start_processing();
                    let _ = upsert_to_storage(&self.backend, &storage_name, job_id, item);
                }
            }
        }

        Ok(job_ids)
    }

    pub fn _process_processing_jobs(&mut self, addr: Addr<WorkQueue<M>>) {
        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let total_processing_jobs = self.backend.queue_count(&processing_queue).unwrap_or(0);
        if total_processing_jobs == 0 {
            return;
        }

        for _ in 0..total_processing_jobs {
            let job_id = self.get_fist_processing_job_id();
            if let Err(err) = job_id {
                error!("Cannot get first processing job {:?}", err);
                continue;
            }

            let job_id = job_id.unwrap();
            if job_id.is_none() {
                continue;
            };
            let job_id = job_id.unwrap();

            match self.read_job(&job_id) {
                Ok(Some(job)) => {
                    if let Err(err) = self.execute_job(job, addr.clone()) {
                        error!("[WorkQueue] Handle job {} fail: {:?}", job_id, err);
                    }
                }
                _ => {
                    error!(
                    "[WorkQueue] Cannot read processing job of {processing_queue}, job id: {job_id}"
                    );
                    // Consider remove the job id
                    self.move_current_job_to_failed(&job_id);
                }
            }
        }
    }

    pub fn execute_job(&mut self, job: Job<M>, addr: Addr<WorkQueue<M>>) -> Result<(), Error> {
        // If job is cancelled -> move to cancel queued
        if job.is_cancelled() {
            self.cancel_current_job(job);
            return Ok(());
        }

        // If job is not ready -> Move back to queue
        if !job.is_ready() {
            return self.re_enqueue(job);
        }

        execute_job(addr, job.clone());

        // If this is interval job (has next tick) -> re_enqueue it
        if let Some(next_job) = job.next_tick() {
            return self.re_enqueue(next_job);
        }

        self.finish_current_job(job)
    }

    pub fn cancel_job(&self, job_id: &str) -> Result<(), Error> {
        let storage_name = self.storage_name();
        if let Some(mut job) = get_from_storage::<Job<M>>(&self.backend, &storage_name, job_id)? {
            job.cancel();
            upsert_to_storage(&self.backend, &storage_name, job_id, job)?;
        }

        Ok(())
    }
}

#[derive(Message, Debug)]
#[rtype(result = "()")]
pub struct Enqueue<M: Executable + Clone + Send + Sync + 'static>(pub Job<M>, pub bool);

impl<M> Handler<Enqueue<M>> for WorkQueue<M>
where
    M: Executable + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,

    Self: Actor<Context = Context<Self>>,
{
    type Result = ();

    fn handle(&mut self, msg: Enqueue<M>, _: &mut Self::Context) -> Self::Result {
        let error_text = format!(
            "Cannot insert new job {:?} to queue {}",
            serde_json::to_string(&msg.0),
            self.job_name
        );
        if self.enqueue_with_config(msg.0, msg.1).is_err() {
            error!("{}", error_text)
        }
    }
}

pub fn enqueue_job<M>(addr: Addr<WorkQueue<M>>, job: Job<M>, force_update: bool)
where
    M: Executable + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,

    WorkQueue<M>: Actor<Context = Context<WorkQueue<M>>>,
{
    addr.do_send::<Enqueue<M>>(Enqueue(job, force_update));
}

#[derive(Message, Debug)]
#[rtype(result = "()")]
pub struct CancelJob {
    pub job_id: String,
}

impl<M> Handler<CancelJob> for WorkQueue<M>
where
    M: Executable + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,

    Self: Actor<Context = Context<Self>>,
{
    type Result = ();

    fn handle(&mut self, msg: CancelJob, _: &mut Self::Context) -> Self::Result {
        let job_id = msg.job_id;
        if let Err(e) = self.cancel_job(&job_id) {
            error!("Cannot cancel job {job_id}: {:?}", e);
        }
    }
}

pub fn cancel_job<M>(addr: Addr<WorkQueue<M>>, job_id: String)
where
    M: Executable + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,

    WorkQueue<M>: Actor<Context = Context<WorkQueue<M>>>,
{
    addr.do_send::<CancelJob>(CancelJob { job_id });
}

#[derive(Message, Debug)]
#[rtype(result = "()")]
pub struct Execute<M: Executable + Clone + Send + Sync + 'static>(pub Job<M>);

impl<M> Handler<Execute<M>> for WorkQueue<M>
where
    M: Executable + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,

    Self: Actor<Context = Context<Self>>,
{
    type Result = ();

    fn handle(&mut self, msg: Execute<M>, ctx: &mut Self::Context) -> Self::Result {
        let task = async move {
            info!("Start Execute job {}", msg.0.id);
            msg.0.message.execute().await;
            info!("End Execute job {}", msg.0.id);
        };

        wrap_future::<_, Self>(task).spawn(ctx);
    }
}

pub fn execute_job<M>(addr: Addr<WorkQueue<M>>, job: Job<M>)
where
    M: Executable + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,

    WorkQueue<M>: Actor<Context = Context<WorkQueue<M>>>,
{
    addr.do_send::<Execute<M>>(Execute(job));
}

#[derive(Message, Debug)]
#[rtype(result = "()")]
pub struct UpdateConfig {
    pub config: WorkQueueConfig,
}

impl<M> Handler<UpdateConfig> for WorkQueue<M>
where
    M: Executable + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,

    Self: Actor<Context = Context<Self>>,
{
    type Result = ();

    fn handle(&mut self, msg: UpdateConfig, _: &mut Self::Context) -> Self::Result {
        self.config = msg.config;
    }
}
pub fn update_queue_config<M>(addr: Addr<WorkQueue<M>>, config: WorkQueueConfig)
where
    M: Executable + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,

    WorkQueue<M>: Actor<Context = Context<WorkQueue<M>>>,
{
    let update_config_mgs = UpdateConfig { config };
    addr.do_send::<UpdateConfig>(update_config_mgs);
}
