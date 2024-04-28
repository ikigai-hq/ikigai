use aj::JobBuilder;
use aj::AJ;
use async_graphql::*;
use diesel::Connection;

use crate::authorization::{DocumentActionPermission, OrganizationActionPermission};
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
        let conn = get_conn_from_ctx(ctx).await?;
        let assignment = Assignment::find_by_id(&conn, assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;
        Assignment::update(&conn, assignment_id, data).format_err()?;

        Ok(true)
    }

    async fn assignment_request_redo(&self, ctx: &Context<'_>, submission_id: i32) -> Result<bool> {
        let conn = get_conn_from_ctx(ctx).await?;
        let submission = Submission::find_by_id(&conn, submission_id)?;
        let assignment = Assignment::find_by_id(&conn, submission.assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;

        Submission::request_redo(&conn, submission_id).format_err()?;
        Ok(true)
    }

    async fn assignment_redo(&self, ctx: &Context<'_>, submission_id: i32) -> Result<bool> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let submission = Submission::find_by_id(&conn, submission_id)?;
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

        Submission::redo(&conn, submission_id).format_err()?;

        Ok(true)
    }

    async fn assignment_start_submission(
        &self,
        ctx: &Context<'_>,
        assignment_id: i32,
    ) -> Result<Submission> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let assignment = Assignment::find_by_id(&conn, assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ViewDocument,
        )
        .await?;

        // Check attempt time
        let last_submission =
            Submission::find_last_submission(&conn, user_id, assignment_id).format_err()?;
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
            Document::find_by_id(&conn, assignment.document_id).format_err()?;

        let submission = conn
            .transaction::<_, IkigaiError, _>(|| {
                let document = assignment_document.deep_clone(
                    &conn,
                    user_id,
                    DocumentCloneConfig::new("", false),
                    assignment_document.space_id,
                    false,
                    None,
                    false,
                )?;
                let submission = if let Some(current_submission) = last_submission {
                    Submission::reset_attempt(
                        &conn,
                        current_submission.id,
                        current_submission.attempt_number + 1,
                        document.id,
                        assignment.test_duration.is_none(),
                        assignment.allow_submission_change_structure,
                    )?
                } else {
                    let new_submission = NewSubmission::new(
                        user_id,
                        assignment_id,
                        document.id,
                        assignment.test_duration.is_none(),
                        assignment.allow_submission_change_structure,
                    );
                    Submission::insert(&conn, new_submission)?
                };
                try_add_rubric_submission(&conn, &assignment, &submission)?;

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

    async fn assignment_start_by_teacher(
        &self,
        ctx: &Context<'_>,
        assignment_id: i32,
        student_id: i32,
    ) -> Result<Submission> {
        let conn = get_conn_from_ctx(ctx).await?;
        let assignment = Assignment::find_by_id(&conn, assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;
        let last_submission =
            Submission::find_last_submission(&conn, student_id, assignment_id).format_err()?;

        if last_submission.is_some() {
            return Err(IkigaiError::new_bad_request(
                "Student already submit, please reload!",
            ))
            .format_err()?;
        }

        let assignment_document =
            Document::find_by_id(&conn, assignment.document_id).format_err()?;
        let submission = conn
            .transaction::<_, IkigaiError, _>(|| {
                let document = assignment_document.deep_clone(
                    &conn,
                    student_id,
                    DocumentCloneConfig::new("", false),
                    assignment_document.space_id,
                    false,
                    None,
                    false,
                )?;
                let new_submission = NewSubmission::new(
                    student_id,
                    assignment_id,
                    document.id,
                    assignment.test_duration.is_none(),
                    assignment.allow_submission_change_structure,
                );
                let submission = Submission::insert(&conn, new_submission)?;
                try_add_rubric_submission(&conn, &assignment, &submission)?;
                Ok(submission)
            })
            .format_err()?;

        Ok(submission)
    }

    async fn assignment_submit_submission(
        &self,
        ctx: &Context<'_>,
        submission_id: i32,
    ) -> Result<Submission> {
        let user = get_user_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let submission = Submission::find_by_id(&conn, submission_id).format_err()?;
        let assignment = Assignment::find_by_id(&conn, submission.assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            submission.document_id,
            DocumentActionPermission::ViewDocument,
        )
        .await?;

        if submission.submit_at.is_some() {
            return Err(IkigaiError::new_bad_request("Cannot submit twice")).format_err()?;
        }

        submit_submission(&conn, &submission, &assignment, false).format_err()?;

        let assignment_document =
            Document::find_by_id(&conn, assignment.document_id).format_err()?;
        let notification =
            Notification::new_submit_submission_notification(SubmitSubmissionContext {
                document_submission_id: submission.document_id,
                submission_name: assignment_document.title,
                student_name: user.name(),
            });
        let notification = Notification::insert(&conn, notification).format_err()?;
        let space_members = SpaceMember::find_all_space_members_by_role_and_class(
            &conn,
            assignment_document.space_id.unwrap_or(-1),
            assignment_document.org_id,
            OrgRole::Teacher,
        )
        .format_err()?;
        let receivers = space_members
            .iter()
            .map(|space_member| space_member.user_id)
            .collect();
        send_notification(&conn, notification, receivers).format_err()?;

        Ok(submission)
    }

    async fn assignment_grade_submission(
        &self,
        ctx: &Context<'_>,
        submission_id: i32,
        grade_data: GradeSubmissionData,
    ) -> Result<bool> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let submission = Submission::find_by_id(&conn, submission_id).format_err()?;
        let assignment = Assignment::find_by_id(&conn, submission.assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;
        Submission::grade_submission(&conn, submission_id, grade_data).format_err()?;

        let submission_document =
            Document::find_by_id(&conn, submission.document_id).format_err()?;
        let notification =
            Notification::new_feedback_submission_notification(FeedbackSubmissionContext {
                document_submission_id: submission.document_id,
                submission_name: submission_document.title,
            });
        let notification = Notification::insert(&conn, notification).format_err()?;
        send_notification(&conn, notification, vec![user_id]).format_err()?;

        Ok(true)
    }

    async fn assignment_add_band_score(
        &self,
        ctx: &Context<'_>,
        mut new_band_score: NewBandScore,
    ) -> Result<BandScore> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            user_auth.org_id,
            OrganizationActionPermission::AddSpace,
        )
        .await?;

        new_band_score.org_id = Some(user_auth.org_id);
        let conn = get_conn_from_ctx(ctx).await?;
        let band_score = BandScore::insert(&conn, new_band_score).format_err()?;
        Ok(band_score)
    }

    async fn assignment_remove_band_score(
        &self,
        ctx: &Context<'_>,
        band_score_id: i32,
    ) -> Result<bool, Error> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            user_auth.org_id,
            OrganizationActionPermission::AddSpace,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let band_score = BandScore::find(&conn, band_score_id).format_err()?;
        if band_score.org_id != Some(user_auth.org_id) {
            return Err(IkigaiError::new_bad_request(
                "Cannot remove band score of another org",
            ))
            .format_err();
        }

        BandScore::remove(&conn, band_score_id).format_err()?;
        Ok(true)
    }

    async fn assignment_update_band_score(
        &self,
        ctx: &Context<'_>,
        band_score_id: i32,
        range: BandScoreRanges,
    ) -> Result<bool, Error> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            user_auth.org_id,
            OrganizationActionPermission::AddSpace,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let band_score = BandScore::find(&conn, band_score_id).format_err()?;
        if band_score.org_id != Some(user_auth.org_id) {
            return Err(IkigaiError::new_bad_request(
                "Cannot remove band score of another org",
            ))
            .format_err();
        }

        BandScore::update(&conn, band_score_id, range).format_err()?;
        Ok(true)
    }

    async fn assignment_update_rubric_submission(
        &self,
        ctx: &Context<'_>,
        data: RubricSubmission,
    ) -> Result<RubricSubmission, Error> {
        let conn = get_conn_from_ctx(ctx).await?;
        let submission = Submission::find_by_id(&conn, data.submission_id).format_err()?;
        let assignment = Assignment::find_by_id(&conn, submission.assignment_id).format_err()?;
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;

        let final_grade = data.graded_data.total_rubric_score();
        let item = conn
            .transaction::<_, IkigaiError, _>(|| {
                Submission::update_final_grade(&conn, submission.id, final_grade)?;
                let item = RubricSubmission::upsert(&conn, data)?;
                Ok(item)
            })
            .format_err()?;

        Ok(item)
    }
}
