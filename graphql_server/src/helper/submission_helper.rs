use crate::background_job::submission_job::CompleteSubmission;
use actix::SystemService;
use aj::{JobBuilder, JobType, AJ};
use diesel::{Connection, PgConnection};
use uuid::Uuid;

use crate::db::*;
use crate::error::IkigaiError;
use crate::graphql::notification_center::{NotificationCenter, SubmitCompleted};
use crate::helper::DocumentCloneConfigBuilder;
use crate::notification_center::send_notification;
use crate::util::{get_date_from_ts, get_now_as_secs};

pub fn submit_submission(
    conn: &mut PgConnection,
    submission: &Submission,
    assignment: &Assignment,
    notify_student: bool,
) -> Result<(), IkigaiError> {
    let grade = auto_grade(conn, submission.document_id, submission.user_id)?;

    let mut final_grade = grade;
    if let Some(band_score_id) = assignment.band_score_id {
        let band_score = BandScore::find(conn, band_score_id)?;
        final_grade = band_score.find_score(grade);
    }

    // Auto release grade in case teacher choose auto grade
    let is_auto_grade = assignment.grade_method == GradeMethod::Auto;
    Submission::submit(conn, submission.id, grade, final_grade, is_auto_grade)?;
    if notify_student {
        NotificationCenter::from_registry().do_send(SubmitCompleted {
            user_id: submission.user_id,
            submission_id: submission.id,
        });
    }

    Ok(())
}

pub fn try_add_rubric_submission(
    conn: &mut PgConnection,
    assignment: &Assignment,
    submission: &Submission,
) -> Result<(), IkigaiError> {
    if let Some(rubric_id) = assignment.grade_by_rubric_id {
        if assignment.grade_method == GradeMethod::Rubric {
            let rubric = Rubric::find_by_id(conn, rubric_id)?;
            let rubric_submission = RubricSubmission::new(submission.id, rubric.id, rubric.data);
            RubricSubmission::upsert(conn, rubric_submission)?;
        }
    }
    Ok(())
}

pub fn auto_grade(
    conn: &mut PgConnection,
    document_id: Uuid,
    user_id: i32,
) -> Result<f64, IkigaiError> {
    let pages = Page::find_all_by_document_id(conn, document_id)?;
    let page_ids = pages.iter().map(|page| page.id).collect();

    let page_contents = PageContent::find_all_by_pages(conn, page_ids)?;
    let page_content_ids = page_contents
        .iter()
        .map(|page_content| page_content.id)
        .collect();

    let quizzes = Quiz::find_all_by_page_contents(conn, &page_content_ids)?;
    let quiz_ids = quizzes.iter().map(|quiz| quiz.id).collect();

    let user_answers = QuizUserAnswer::find_all_by_quizzes_and_user(conn, &quiz_ids, user_id)?;
    Ok(user_answers.iter().map(|answer| answer.score).sum())
}

pub fn start_submission(
    conn: &mut PgConnection,
    user: &User,
    assignment: &Assignment,
    assignment_document: &Document,
    last_submission: &Option<Submission>,
) -> Result<Submission, IkigaiError> {
    let user_id = user.id;
    let assignment_id = assignment.id;
    let submission = conn.transaction::<_, IkigaiError, _>(|conn| {
        let config = DocumentCloneConfigBuilder::default()
            .prefix_title(format!("[{}] ", user.name()))
            .creator_id(user_id)
            .clone_to_space(assignment_document.space_id)
            .clone_children(false)
            .keep_document_type(false)
            .build()
            .unwrap();
        let document = assignment_document.deep_clone(conn, config)?;

        let new_submission = NewSubmission::new(
            user_id,
            assignment_id,
            document.id,
            last_submission
                .as_ref()
                .map_or_else(|| 1, |s| s.attempt_number + 1),
            assignment.test_duration.is_none(),
            assignment.test_duration,
        );
        let submission = Submission::insert(conn, new_submission)?;

        try_add_rubric_submission(conn, assignment, &submission)?;

        Ok(submission)
    })?;

    if let Some(close_in) = submission.test_duration {
        let message = CompleteSubmission {
            attempt_number: submission.attempt_number,
            submission_id: submission.id,
        };
        let job = JobBuilder::default()
            .message(message)
            .job_type(JobType::ScheduledAt(get_date_from_ts(
                get_now_as_secs() + close_in as i64,
            )))
            .build()?;
        AJ::add_job(job);
    }

    let receiver_ids = vec![assignment_document.creator_id];
    let notification = Notification::new_do_assignment_notification(DoAssignmentContext {
        student_id: user.id,
        student_name: user.name(),
        submission_document_id: submission.document_id,
        assignment_name: assignment_document.title.clone(),
    });
    let notification = Notification::insert(conn, notification)?;
    send_notification(conn, notification, receiver_ids)?;

    Ok(submission)
}
