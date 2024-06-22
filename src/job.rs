use async_trait::async_trait;
use chrono::{serde::ts_microseconds, serde::ts_microseconds_option, DateTime, Duration, Utc};
use cron::Schedule;
use serde::{Deserialize, Serialize};
use std::fmt::Debug;
use std::str::FromStr;

use crate::util::{get_now, get_now_as_ms};
use crate::Error;

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
        Self::new_interval_retry(Some(3), chrono::TimeDelta::try_milliseconds(100).unwrap())
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
    type Output: Debug + Send;

    async fn execute(&self) -> Self::Output;

    // Rust idiom prefers use `?` syntax to return as soon as possible.
    // Sometimes, you have a logic that want to be run in any situations like logging, store the job result, etc.
    // You can use `post_execute` fn.
    async fn post_execute(&self, output: Self::Output) -> Self::Output {
        output
    }

    // Declare the output of execution is failed -> Trigger retry
    async fn is_failed_output(&self, _job_output: Self::Output) -> bool {
        false
    }

    // Override this function to custom retry logic
    // None => no need to retry
    // Some(ms) => next time to retry this function
    async fn should_retry(
        &self,
        retry_context: &mut Retry,
        job_output: Self::Output,
    ) -> Option<DateTime<Utc>> {
        let should_retry = self.is_failed_output(job_output).await && retry_context.should_retry();

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

impl JobType {
    pub fn init_cron(expression: &str, context: CronContext) -> Result<Self, Error> {
        let schedule = Schedule::from_str(expression)?;
        let now = get_now();
        let next_tick = schedule.after(&now).next().unwrap_or(now);
        Ok(Self::Cron(expression.into(), next_tick, 1, context))
    }
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

#[derive(Debug, Serialize, Deserialize, Clone, Builder)]
pub struct Job<M: Executable + Clone> {
    #[builder(default = "uuid::Uuid::new_v4().to_string()")]
    pub id: String,
    #[builder(default = "JobType::Normal")]
    pub job_type: JobType,
    #[builder(default = "JobStatus::Created")]
    pub job_status: JobStatus,
    pub message: M,
    #[builder(default, setter(skip))]
    pub enqueue_at: Option<i64>,
    #[builder(default, setter(skip))]
    pub process_at: Option<i64>,
    #[builder(default, setter(skip))]
    pub complete_at: Option<i64>,
    #[builder(default, setter(skip))]
    pub cancel_at: Option<i64>,
    #[builder(default = "get_now_as_ms()", setter(skip))]
    pub created_at: i64,
    #[builder(setter(into, strip_option), default)]
    pub retry: Option<Retry>,
}

impl<M> Job<M>
where
    M: Executable + Clone,
{
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
