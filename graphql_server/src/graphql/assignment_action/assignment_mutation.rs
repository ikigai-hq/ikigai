use aj::JobBuilder;
use aj::AJ;
use async_graphql::*;
use diesel::Connection;

use crate::authorization::DocumentActionPermission;
use crate::background_job::submission_job::CompleteSubmission;
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::*;
use crate::notification_center::send_notification;
use crate::util::{get_date_from_ts, get_now_as_secs};

#[derive(Default)]
pub struct AssignmentMutation;

#[Object]
impl AssignmentMutation {
    async fn assignment_update(
        &self,
        ctx: &Context<'_>,
        assignment_id: i32,
        data: UpdateAssignmentData,
    ) -> Result<bool> {
        let mut conn = get_conn_from_ctx(ctx).await?;
        let assignment = Assignment::find_by_id(&mut conn, assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;
        Assignment::update(&mut conn, assignment_id, data).format_err()?;

        Ok(true)
    }

    async fn assignment_request_redo(&self, ctx: &Context<'_>, submission_id: i32) -> Result<bool> {
        let mut conn = get_conn_from_ctx(ctx).await?;
        let submission = Submission::find_by_id(&mut conn, submission_id)?;
        let assignment =
            Assignment::find_by_id(&mut conn, submission.assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;

        Submission::request_redo(&mut conn, submission_id).format_err()?;
        Ok(true)
    }

    async fn assignment_redo(&self, ctx: &Context<'_>, submission_id: i32) -> Result<bool> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        let submission = Submission::find_by_id(&mut conn, submission_id)?;
        document_quick_authorize(
            ctx,
            submission.document_id,
            DocumentActionPermission::ViewDocument,
        )
        .await?;

        if submission.user_id != user_id {
            return Err(IkigaiError::new_bad_request(
                "Incorrect owner of submission",
            ))
            .format_err();
        }

        if !submission.allow_rework {
            return Err(IkigaiError::new_bad_request("Cannot redo submission")).format_err()?;
        }

        Submission::redo(&mut conn, submission_id).format_err()?;

        Ok(true)
    }

    async fn assignment_start_submission(
        &self,
        ctx: &Context<'_>,
        assignment_id: i32,
    ) -> Result<Submission> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        let assignment = Assignment::find_by_id(&mut conn, assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ViewDocument,
        )
        .await?;

        // Check attempt time
        let last_submission =
            Submission::find_last_submission(&mut conn, user_id, assignment_id).format_err()?;
        if let (Some(last_submission), Some(max_number_of_attempt)) =
            (&last_submission, assignment.max_number_of_attempt)
        {
            if last_submission.attempt_number + 1 > max_number_of_attempt {
                return Err(IkigaiError::new_bad_request(
                    "You reach max attempt times for this assignment!",
                ))
                .format_err();
            }
        }

        if let Some(last_submission) = &last_submission {
            if last_submission.feedback_at.is_some() {
                return Err(IkigaiError::new_bad_request(
                    "Your teacher already feedback your last submission, please review it!",
                ))
                .format_err();
            }
        }

        let assignment_document =
            Document::find_by_id(&mut conn, assignment.document_id).format_err()?;

        let submission = conn
            .transaction::<_, IkigaiError, _>(|conn| {
                let document = assignment_document.deep_clone(
                    conn,
                    user_id,
                    DocumentCloneConfig::new("", false),
                    assignment_document.space_id,
                    false,
                    None,
                    false,
                )?;

                let new_submission = NewSubmission::new(
                    user_id,
                    assignment_id,
                    document.id,
                    last_submission.map_or_else(|| 1, |s| s.attempt_number + 1),
                    assignment.test_duration.is_none(),
                );
                let submission = Submission::insert(conn, new_submission)?;

                try_add_rubric_submission(conn, &assignment, &submission)?;

                Ok(submission)
            })
            .format_err()?;

        if assignment.force_auto_submit {
            if let Some(close_in) = assignment.test_duration {
                let message = CompleteSubmission {
                    attempt_number: submission.attempt_number,
                    submission_id: submission.id,
                };
                let job = JobBuilder::new(message)
                    .set_schedule_at(get_date_from_ts(get_now_as_secs() + close_in as i64))
                    .build();
                AJ::add_job(job);
            }
        }

        Ok(submission)
    }

    async fn assignment_submit_submission(
        &self,
        ctx: &Context<'_>,
        submission_id: i32,
    ) -> Result<Submission> {
        let user = get_user_from_ctx(ctx).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        let submission = Submission::find_by_id(&mut conn, submission_id).format_err()?;
        let assignment =
            Assignment::find_by_id(&mut conn, submission.assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            submission.document_id,
            DocumentActionPermission::ViewDocument,
        )
        .await?;

        if submission.submit_at.is_some() {
            return Err(IkigaiError::new_bad_request("Cannot submit twice")).format_err()?;
        }

        submit_submission(&mut conn, &submission, &assignment, false).format_err()?;

        let assignment_document =
            Document::find_by_id(&mut conn, assignment.document_id).format_err()?;
        let notification =
            Notification::new_submit_submission_notification(SubmitSubmissionContext {
                document_submission_id: submission.document_id,
                submission_name: assignment_document.title,
                student_name: user.name(),
            });
        let notification = Notification::insert(&mut conn, notification).format_err()?;
        let space_members = SpaceMember::find_all_space_members_by_role_and_class(
            &mut conn,
            assignment_document.space_id.unwrap_or(-1),
            Role::Teacher,
        )
        .format_err()?;
        let receivers = space_members
            .iter()
            .map(|space_member| space_member.user_id)
            .collect();
        send_notification(&mut conn, notification, receivers).format_err()?;

        Ok(submission)
    }

    async fn assignment_grade_submission(
        &self,
        ctx: &Context<'_>,
        submission_id: i32,
        grade_data: GradeSubmissionData,
    ) -> Result<bool> {
        let mut conn = get_conn_from_ctx(ctx).await?;
        let submission = Submission::find_by_id(&mut conn, submission_id).format_err()?;
        let assignment =
            Assignment::find_by_id(&mut conn, submission.assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;
        Submission::grade_submission(&mut conn, submission_id, grade_data).format_err()?;

        let submission_document =
            Document::find_by_id(&mut conn, submission.document_id).format_err()?;
        let notification =
            Notification::new_feedback_submission_notification(FeedbackSubmissionContext {
                document_submission_id: submission.document_id,
                submission_name: submission_document.title,
            });
        let notification = Notification::insert(&mut conn, notification).format_err()?;
        send_notification(&mut conn, notification, vec![submission.user_id]).format_err()?;

        Ok(true)
    }

    async fn assignment_update_rubric_submission(
        &self,
        ctx: &Context<'_>,
        data: RubricSubmission,
    ) -> Result<RubricSubmission, Error> {
        let mut conn = get_conn_from_ctx(ctx).await?;
        let submission = Submission::find_by_id(&mut conn, data.submission_id).format_err()?;
        let assignment =
            Assignment::find_by_id(&mut conn, submission.assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;

        let final_grade = data.graded_data.total_rubric_score();
        let item = conn
            .transaction::<_, IkigaiError, _>(|conn| {
                Submission::update_final_grade(conn, submission.id, final_grade)?;
                let item = RubricSubmission::upsert(conn, data)?;
                Ok(item)
            })
            .format_err()?;

        Ok(item)
    }
}
