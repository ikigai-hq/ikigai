use actix::fut::wrap_future;
use actix::*;
use redis::Direction;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::fmt::Debug;
use std::marker::PhantomData;
use std::time::Duration;

use crate::backend::{storage_get, storage_upsert, Backend};
use crate::job::{Job, JobStatus};
use crate::{Error, Executable};

const IMPORT_JOBS_EACH_BATCH: usize = 5;
// Time to declare period between 2 import processing jobs
const JOB_PICKER_DURATION: Duration = Duration::from_millis(500);
// Time to declare period between 2 times to handling processing jobs
const JOB_HANDLER_DURATION: Duration = Duration::from_millis(500);

pub struct WorkQueue<M>
where
    M: Executable + Send + Sync + Clone + Serialize + DeserializeOwned + 'static,
    Self: Actor<Context = Context<Self>>,
{
    pub name: String,
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
    pub fn new(name: String, backend: impl Backend + 'static) -> Self {
        Self {
            name,
            _type: PhantomData,
            backend: Box::new(backend),
        }
    }

    pub fn format_queue_name(&self, status: JobStatus) -> String {
        format!("{}:queue:{:?}", self.name, status)
    }

    pub fn format_failed_queue_name(&self) -> String {
        format!("{}:queue:failed", self.name)
    }

    pub fn storage_name(&self) -> String {
        format!("{}:storage", self.name)
    }

    pub fn start_with_name(name: String, backend: impl Backend + Send + 'static) -> Addr<Self> {
        let arbiter = Arbiter::new();

        <Self as Actor>::start_in_arbiter(&arbiter.handle(), |ctx| {
            let mut q = WorkQueue::<M>::new(name, backend);
            q.run_job_picker(ctx);
            q.run_job_handler(ctx);
            q
        })
    }

    pub fn enqueue_with_config(&self, job: Job<M>, re_run: bool) -> Result<(), Error> {
        let key = job.id.clone();
        if let Some(existing_job) =
            storage_get::<Job<M>>(&self.backend, &self.storage_name(), &key)?
        {
            if !existing_job.is_done() {
                info!("Update exising job with new information: {}", job.id);
                storage_upsert(&self.backend, &self.storage_name(), &key, &job)?;
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
        storage_upsert(&self.backend, &self.storage_name(), &key, &job)?;
        Ok(())
    }

    pub fn re_enqueue(&self, mut job: Job<M>) -> Result<(), Error> {
        debug!("Re Enqueue job {}", job.id);
        job.job_status = JobStatus::Queued;
        storage_upsert(&self.backend, &self.storage_name(), &job.id, &job)?;

        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let queued_queue = self.format_queue_name(JobStatus::Queued);
        if let Err(e) = self.backend.queue_move(
            &processing_queue,
            &queued_queue,
            1,
            Direction::Left,
            Direction::Left,
        ) {
            error!("[WorkQueue] Cannot re enqueue {}: {:?}", job.id, e);
        };
        Ok(())
    }

    pub fn cancel_current_job(&self, job: Job<M>) {
        info!("Cancel job {}", job.id);
        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let cancelled_queue = self.format_queue_name(JobStatus::Canceled);
        if let Err(e) = self.backend.queue_move(
            &processing_queue,
            &cancelled_queue,
            1,
            Direction::Left,
            Direction::Left,
        ) {
            error!("[WorkQueue] Cannot re enqueue {}: {:?}", job.id, e);
        };
    }

    pub fn finish_current_job(&self, mut job: Job<M>) -> Result<(), Error> {
        info!("Finish job {}", job.id);
        job.finish();
        storage_upsert(&self.backend, &self.storage_name(), &job.id, &job)?;

        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let finished_queue = self.format_queue_name(JobStatus::Finished);
        if let Err(e) = self.backend.queue_move(
            &processing_queue,
            &finished_queue,
            1,
            Direction::Left,
            Direction::Left,
        ) {
            error!("[WorkQueue] Cannot finish {}: {:?}", job.id, e);
        };
        Ok(())
    }

    pub fn move_current_job_to_failed(&self, job_id: &str) {
        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let failed_queue = self.format_failed_queue_name();
        if let Err(e) = self.backend.queue_move(
            &processing_queue,
            &failed_queue,
            1,
            Direction::Left,
            Direction::Left,
        ) {
            error!(
                "[WorkQueue] Cannot move to failed queue {}: {:?}",
                job_id, e
            );
        };
    }

    pub fn import_processing_jobs(&self, count: usize) -> Result<Vec<String>, Error> {
        let idle_queue_name = self.format_queue_name(JobStatus::Queued);
        let processing_queue_name = self.format_queue_name(JobStatus::Processing);
        let job_ids = self.backend.queue_move(
            &idle_queue_name,
            &processing_queue_name,
            count,
            Direction::Right,
            Direction::Left,
        )?;

        let storage_name = self.storage_name();
        for job_id in &job_ids {
            if let Ok(Some(mut item)) = storage_get::<Job<M>>(&self.backend, &storage_name, job_id)
            {
                item.start_processing();
                let _ = storage_upsert(&self.backend, &storage_name, job_id, item);
            }
        }

        Ok(job_ids)
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

        let item = storage_get(&self.backend, &storage_name, job_id)?;
        Ok(item)
    }

    // This logic will pick job from queued jobs -> processing jobs
    pub fn run_job_picker(&self, ctx: &mut Context<WorkQueue<M>>) {
        self._import_job();
        ctx.run_later(JOB_PICKER_DURATION, |work_queue, ctx| {
            work_queue.run_job_picker(ctx);
        });
    }

    pub fn _import_job(&self) {
        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let total_processing_jobs = self.backend.queue_count(&processing_queue).unwrap_or(0);
        if total_processing_jobs > 0 {
            return;
        }

        // No job in processing queue, should import queued jobs to processing
        if let Err(err) = self.import_processing_jobs(IMPORT_JOBS_EACH_BATCH) {
            error!(
                "[WorkQueue]: Cannot import processing jobs of {} :{:?}",
                processing_queue, err
            );
        }
    }

    // This job will pick job in processing queue
    // Complete 1 batch and re run
    pub fn run_job_handler(&mut self, ctx: &mut Context<WorkQueue<M>>) {
        self._handle_processing_jobs(ctx.address());
        ctx.run_later(JOB_HANDLER_DURATION, |work_queue, ctx| {
            work_queue.run_job_handler(ctx);
        });
    }

    pub fn _handle_processing_jobs(&mut self, addr: Addr<WorkQueue<M>>) {
        let processing_queue = self.format_queue_name(JobStatus::Processing);
        let total_processing_jobs = self.backend.queue_count(&processing_queue).unwrap_or(0);
        if total_processing_jobs == 0 {
            return;
        }

        // Processing job is not empty. Should pick and process
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
                    if let Err(err) = self._handle_processing_job(job, addr.clone()) {
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

    pub fn _handle_processing_job(
        &mut self,
        job: Job<M>,
        addr: Addr<WorkQueue<M>>,
    ) -> Result<(), Error> {
        // If job is cancelled -> move to cancel queued
        if job.is_cancelled() {
            self.cancel_current_job(job);
            return Ok(());
        }

        // If job is not ready -> Move back to queue
        if !job.is_ready() {
            return self.re_enqueue(job);
        }

        // Assume always success handle job
        execute_job(addr, job.clone());

        // Handle next job
        if let Some(next_job) = job.next_tick() {
            return self.re_enqueue(next_job);
        }

        self.finish_current_job(job)
    }

    pub fn cancel_job(&self, job_id: &str) -> Result<(), Error> {
        let storage_name = self.storage_name();
        if let Some(mut job) = storage_get::<Job<M>>(&self.backend, &storage_name, job_id)? {
            job.cancel();
            storage_upsert(&self.backend, &storage_name, job_id, job)?;
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
            self.name
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
