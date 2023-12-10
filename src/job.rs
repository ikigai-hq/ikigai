use async_trait::async_trait;
use cron::Schedule;
use serde::Serialize;
use std::str::FromStr;
use uuid::Uuid;

use crate::util::{get_datetime_as_secs, get_now, get_now_as_secs};

#[async_trait]
pub trait Executable {
    async fn execute(&self);
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CronContext {
    pub max_repeat: Option<i32>,
    pub end_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum JobType {
    // Instant background job
    Normal,
    // Schedule Job: (Next schedule at)
    ScheduledAt(i64),
    // Cron Job: Cron Expression, next schedule at, total repeat, Cron Context
    Cron(
        String,
        i64,
        #[serde(default)] i32,
        #[serde(default)] CronContext,
    ),
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
pub enum JobStatus {
    Created,
    Queued,
    Processing,
    Finished,
    Canceled,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Job<M: Executable + Clone + Send + Sync + 'static> {
    pub id: String,
    pub job_type: JobType,
    pub job_status: JobStatus,
    pub message: M,
    pub enqueue_at: Option<i64>,
    pub process_at: Option<i64>,
    pub complete_at: Option<i64>,
    pub cancel_at: Option<i64>,
    pub created_at: i64,
}

impl<M: Executable + Clone + Send + Sync + 'static> Job<M> {
    pub fn new(id: String, job_type: JobType, job_status: JobStatus, message: M) -> Self {
        Self {
            id,
            job_type,
            job_status,
            message,
            created_at: get_now_as_secs(),
            enqueue_at: None,
            process_at: None,
            complete_at: None,
            cancel_at: None,
        }
    }

    pub fn is_ready(&self) -> bool {
        let now = get_now_as_secs();
        match &self.job_type {
            JobType::ScheduledAt(ts) => now > *ts,
            JobType::Cron(_, next_slot, total_repeat, context) => {
                if now < *next_slot {
                    return false;
                }

                if let Some(max_repeat) = context.max_repeat {
                    if max_repeat < *total_repeat {
                        return false;
                    }
                }

                if let Some(end_at) = context.end_at {
                    if now > end_at {
                        return false;
                    }
                }

                true
            }
            _ => true,
        }
    }

    pub fn next_tick(&self) -> Option<Self> {
        let now = get_now_as_secs();
        match &self.job_type {
            JobType::Cron(cron_expression, _, total_repeat, context) => {
                let mut job = self.clone();
                let schedule = Schedule::from_str(cron_expression);
                if schedule.is_err() {
                    error!(
                        "[Job] Cannot parse schedule {cron_expression} of job {}",
                        job.id
                    );
                    return None;
                }

                let schedule = schedule.unwrap();
                if let Some(upcoming_event) = schedule.after(&get_now()).next() {
                    job.job_type = JobType::Cron(
                        cron_expression.clone(),
                        get_datetime_as_secs(upcoming_event),
                        *total_repeat + 1,
                        context.clone(),
                    );
                }

                if let Some(max_repeat) = context.max_repeat {
                    if max_repeat > *total_repeat {
                        return Some(job);
                    }
                }

                if let Some(end_at) = context.end_at {
                    if end_at > now {
                        return Some(job);
                    }
                }

                None
            }
            _ => None,
        }
    }

    pub fn is_cancelled(&self) -> bool {
        self.job_status == JobStatus::Canceled
    }

    pub fn is_done(&self) -> bool {
        self.job_status == JobStatus::Finished || self.job_status == JobStatus::Canceled
    }

    pub fn enqueue(&mut self) {
        debug!("[Job] Enqueue {}", self.id);
        self.job_status = JobStatus::Queued;
        self.enqueue_at = Some(get_now_as_secs());
    }

    pub fn start_processing(&mut self) {
        debug!("[Job] Processing {}", self.id);
        self.job_status = JobStatus::Processing;
        self.process_at = Some(get_now_as_secs());
    }

    pub fn finish(&mut self) {
        debug!("[Job] Finish {}", self.id);
        self.job_status = JobStatus::Finished;
        self.complete_at = Some(get_now_as_secs());
    }

    pub fn cancel(&mut self) {
        debug!("[Job] Cancel {}", self.id);
        self.job_status = JobStatus::Canceled;
        self.cancel_at = Some(get_now_as_secs());
    }
}

#[derive(Debug, Clone, Default)]
pub struct JobBuilder<M: Executable + Clone + Send + Sync + 'static> {
    pub id: Option<String>,
    pub job_type: Option<JobType>,
    pub message: M,
}

impl<M: Executable + Clone + Send + Sync + 'static> JobBuilder<M> {
    pub fn new(message: M) -> Self {
        Self {
            id: None,
            job_type: None,
            message,
        }
    }

    pub fn set_id(mut self, id: String) -> Self {
        self.id = Some(id);
        self
    }

    pub fn set_job_type(mut self, job_type: JobType) -> Self {
        self.job_type = Some(job_type);
        self
    }

    pub fn set_job_normal(self) -> Self {
        self.set_job_type(JobType::Normal)
    }

    pub fn set_schedule_at(self, schedule_at: i64) -> Self {
        self.set_job_type(JobType::ScheduledAt(schedule_at))
    }

    pub fn set_cron(self, cron: Schedule, context: CronContext) -> Self {
        let now = get_now();
        let next_time = cron.after(&now).next().unwrap_or(now);
        self.set_job_type(JobType::Cron(
            cron.to_string(),
            get_datetime_as_secs(next_time),
            1,
            context,
        ))
    }

    pub fn build(self) -> Job<M> {
        let id = self.id.unwrap_or(Uuid::new_v4().to_string());
        let job_type = self.job_type.unwrap_or(JobType::Normal);

        Job::new(id, job_type, JobStatus::Created, self.message)
    }
}
