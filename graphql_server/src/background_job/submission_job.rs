use aj::async_trait::async_trait;
use aj::Executable;

use crate::connection_pool::get_conn_from_actor;
use crate::db::{Assignment, Submission};
use crate::error::IkigaiError;
use crate::helper::submit_submission;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompleteSubmission {
    pub attempt_number: i32,
    pub submission_id: i32,
}

async fn handle_complete_submission(msg: &CompleteSubmission) -> Result<(), IkigaiError> {
    info!("Start complete submission by background_job job {:?}", msg);
    let submission_id = msg.submission_id;

    let mut conn = get_conn_from_actor().await?;
    let submission = Submission::find_by_id(&mut conn, submission_id)?;

    // Student doing another session, skip
    if submission.attempt_number != msg.attempt_number {
        return Ok(());
    }

    // Student already submit
    if submission.submit_at.is_some() {
        return Ok(());
    }

    // Should close the submission
    let assignment = Assignment::find_by_id(&mut conn, submission.assignment_id)?;
    submit_submission(&mut conn, &submission, &assignment, true)?;

    Ok(())
}

#[async_trait]
impl Executable for CompleteSubmission {
    type Output = ();

    async fn execute(&self) {
        if let Err(e) = handle_complete_submission(self).await {
            error!(
                "Cannot complete submission {} in background_job job by {:?}",
                self.submission_id, e
            );
        };
    }
}
