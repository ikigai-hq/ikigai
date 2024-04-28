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
    let mut grade = 0.0;
    let document_ids = fetch_graded_document_ids(conn, submission.document_id)?;
    for document_id in document_ids {
        let i_grade = auto_grade(conn, document_id, submission.user_id)?;
        grade += i_grade;
    }

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

// Only count quiz scores and ignore nested, page block, etc
pub fn auto_grade(
    conn: &PgConnection,
    document_id: Uuid,
    user_id: i32,
) -> Result<f64, IkigaiError> {
    let document = Document::find_by_id(conn, document_id)?;
    let quizzes = Quiz::find_all_by_document_id(conn, document_id)?;
    let quiz_ids = quizzes
        .iter()
        .filter(|q| document.body.as_str().contains(q.id.to_string().as_str()))
        .map(|q| q.id)
        .collect();
    let user_answers = QuizAnswer::find_all_by_quiz_ids_and_user(conn, quiz_ids, user_id)?;

    let grade = user_answers.iter().map(|a| a.score).sum();

    Ok(grade)
}

// Support 1 layer only
pub fn fetch_graded_document_ids(
    conn: &PgConnection,
    document_id: Uuid,
) -> Result<Vec<Uuid>, IkigaiError> {
    let page_blocks = PageBlock::find_all_by_document(conn, document_id)?;
    let page_block_ids = page_blocks.iter().map(|page_block| page_block.id).collect();
    let page_block_documents = PageBlockDocument::find_all_by_page_blocks(conn, page_block_ids)?;
    let mut document_ids: Vec<Uuid> = page_block_documents.iter().map(|d| d.document_id).collect();
    document_ids.push(document_id);
    Ok(document_ids)
}
