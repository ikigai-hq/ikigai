use crate::get_ms_as_datetime;
use async_trait::async_trait;
use chrono::{serde::ts_microseconds, serde::ts_microseconds_option, DateTime, Duration, Utc};
use cron::Schedule;
use serde::{Deserialize, Serialize};
use std::fmt::Debug;
use std::str::FromStr;
use uuid::Uuid;

use crate::util::{get_now, get_now_as_ms};

#[serde_as]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RetryStrategy {
    Interval(#[serde_as(as = "serde_with::DurationMicroSeconds<i64>")] Duration), // ms
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Retry {
    retried_times: i32,
    // None = never stop retry
    max_retries: Option<i32>,
    strategy: RetryStrategy,
}

impl Default for Retry {
    fn default() -> Self {
        Self::new_interval_retry(Some(3), Duration::milliseconds(100))
    }
}

impl Retry {
    pub fn new(retried_times: i32, max_retries: Option<i32>, strategy: RetryStrategy) -> Self {
        Self {
            retried_times,
            max_retries,
            strategy,
        }
    }

    pub fn new_interval_retry(max_retries: Option<i32>, interval: Duration) -> Self {
        Self::new(0, max_retries, RetryStrategy::Interval(interval))
    }

    pub fn should_retry(&self) -> bool {
        if let Some(max_retries) = self.max_retries {
            self.retried_times < max_retries
        } else {
            true
        }
    }

    pub fn retry(&mut self) -> DateTime<Utc> {
        self.retried_times += 1;
        match &self.strategy {
            RetryStrategy::Interval(ms) => get_now() + *ms,
        }
    }
}

#[async_trait]
pub trait Executable {
    type Output: Debug;

    async fn execute(&self) -> Self::Output;

    // Declare the output of execution is failed -> Trigger retry
    fn is_failed_output(&self, _job_output: &Self::Output) -> bool {
        false
    }

    // Override this function to custom retry logic
    // None => no need to retry
    // Some(ms) => next time to retry this function
    fn should_retry(
        &self,
        retry_context: &mut Retry,
        job_output: &Self::Output,
    ) -> Option<DateTime<Utc>> {
        let should_retry = self.is_failed_output(job_output) && retry_context.should_retry();

        if should_retry {
            Some(retry_context.retry())
        } else {
            None
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CronContext {
    pub max_repeat: Option<i32>,
    #[serde(with = "ts_microseconds_option")]
    pub end_at: Option<DateTime<Utc>>,
}

#[serde_as]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum JobType {
    // DateTime<Utc> background job
    Normal,
    // Schedule Job: (Next schedule at)
    ScheduledAt(#[serde(with = "ts_microseconds")] DateTime<Utc>),
    // Cron Job: Cron Expression, next schedule at, total repeat, Cron Context
    Cron(
        String,
        #[serde(with = "ts_microseconds")] DateTime<Utc>,
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
    Failed,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Job<M: Executable + Clone> {
    pub id: String,
    pub job_type: JobType,
    pub job_status: JobStatus,
    pub message: M,
    pub enqueue_at: Option<i64>,
    pub process_at: Option<i64>,
    pub complete_at: Option<i64>,
    pub cancel_at: Option<i64>,
    pub created_at: i64,
    pub retry: Option<Retry>,
}

impl<M> Job<M>
where
    M: Executable + Clone,
{
    pub fn new(
        id: String,
        job_type: JobType,
        job_status: JobStatus,
        message: M,
        retry: Option<Retry>,
    ) -> Self {
        Self {
            id,
            job_type,
            job_status,
            message,
            created_at: get_now_as_ms(),
            enqueue_at: None,
            process_at: None,
            complete_at: None,
            cancel_at: None,
            retry,
        }
    }

    pub fn is_ready(&self) -> bool {
        let now = get_now();
        match &self.job_type {
            JobType::ScheduledAt(schedule_at) => &now > schedule_at,
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

    pub fn next_tick(&mut self) -> Option<Self> {
        let now = get_now();
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
                        upcoming_event,
                        *total_repeat + 1,
                        context.clone(),
                    );
                }

                if let Some(max_repeat) = context.max_repeat {
                    if max_repeat < *total_repeat {
                        return None;
                    }
                }

                if let Some(end_at) = context.end_at {
                    if end_at < now {
                        return None;
                    }
                }

                Some(job)
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
        self.enqueue_at = Some(get_now_as_ms());
    }

    pub fn start_processing(&mut self) {
        debug!("[Job] Processing {}", self.id);
        self.job_status = JobStatus::Processing;
        self.process_at = Some(get_now_as_ms());
    }

    pub fn finish(&mut self) {
        debug!("[Job] Finish {}", self.id);
        self.job_status = JobStatus::Finished;
        self.complete_at = Some(get_now_as_ms());
    }

    pub fn cancel(&mut self) {
        debug!("[Job] Cancel {}", self.id);
        self.job_status = JobStatus::Canceled;
        self.cancel_at = Some(get_now_as_ms());
    }

    pub fn fail(&mut self) {
        debug!("[Job] Cancel {}", self.id);
        self.job_status = JobStatus::Failed;
        self.complete_at = Some(get_now_as_ms());
    }
}

#[derive(Debug, Clone, Default)]
pub struct JobBuilder<M: Executable + Clone> {
    pub id: Option<String>,
    pub job_type: Option<JobType>,
    pub retry: Option<Retry>,
    pub message: M,
}

impl<M: Executable + Clone> JobBuilder<M> {
    pub fn new(message: M) -> Self {
        Self {
            id: None,
            job_type: None,
            retry: None,
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

    pub fn set_schedule_at(self, schedule_at: DateTime<Utc>) -> Self {
        self.set_job_type(JobType::ScheduledAt(schedule_at))
    }

    pub fn run_after_ms(self, ms: i64) -> Self {
        let dt = get_ms_as_datetime(ms);
        self.set_schedule_at(dt)
    }

    pub fn run_after_secs(self, secs: i64) -> Self {
        self.run_after_ms(secs * 1_000)
    }

    pub fn set_cron(self, cron: Schedule, context: CronContext) -> Self {
        let now = get_now();
        let next_time = cron.after(&now).next().unwrap_or(now);
        self.set_job_type(JobType::Cron(cron.to_string(), next_time, 1, context))
    }

    pub fn set_retry(mut self, retry: Retry) -> Self {
        self.retry = Some(retry);
        self
    }

    pub fn build(self) -> Job<M> {
        let id = self.id.unwrap_or(Uuid::new_v4().to_string());
        let job_type = self.job_type.unwrap_or(JobType::Normal);

        Job::new(id, job_type, JobStatus::Created, self.message, self.retry)
    }
}
