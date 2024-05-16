use actix::SystemService;
use diesel::PgConnection;
use uuid::Uuid;

use crate::db::*;
use crate::error::IkigaiError;
use crate::graphql::notification_center::{NotificationCenter, SubmitCompleted};

pub fn submit_submission(
    conn: &PgConnection,
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
    let is_auto_grade = assignment.grade_method == GradeMethod::AutoGrade;
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
    conn: &PgConnection,
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

// FIXME: Calculate new method
// Only count quiz scores and ignore nested, page block, etc
pub fn auto_grade(
    _conn: &PgConnection,
    _document_id: Uuid,
    _user_id: i32,
) -> Result<f64, IkigaiError> {
    Ok(0.0)
}
