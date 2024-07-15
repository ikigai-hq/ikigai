use diesel::result::Error;
use diesel::{AsChangeset, ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::assignment_submissions;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = assignment_submissions)]
pub struct NewSubmission {
    pub assignment_id: i32,
    pub user_id: i32,
    pub auto_grade: Option<f64>,
    pub feedback: Option<String>,
    pub final_grade: Option<f64>,
    pub updated_at: i64,
    pub created_at: i64,
    pub document_id: Uuid,
    pub attempt_number: i32,
    pub allow_rework: bool,
    pub submit_at: Option<i64>,
    pub test_duration: Option<i32>,
}

impl From<Submission> for NewSubmission {
    fn from(value: Submission) -> Self {
        Self {
            assignment_id: value.assignment_id,
            user_id: value.user_id,
            auto_grade: value.auto_grade,
            feedback: value.feedback,
            final_grade: value.final_grade,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
            document_id: value.document_id,
            attempt_number: value.attempt_number,
            allow_rework: value.allow_rework,
            submit_at: value.submit_at,
            test_duration: value.test_duration,
        }
    }
}

impl NewSubmission {
    pub fn update_time(&mut self) {
        self.updated_at = get_now_as_secs();
        self.created_at = get_now_as_secs();
    }

    pub fn new(
        user_id: i32,
        assignment_id: i32,
        document_id: Uuid,
        attempt_number: i32,
        allow_rework: bool,
        test_duration: Option<i32>,
    ) -> Self {
        Self {
            assignment_id,
            document_id,
            user_id,
            auto_grade: None,
            final_grade: None,
            feedback: None,
            submit_at: None,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
            attempt_number,
            allow_rework,
            test_duration,
        }
    }
}

#[derive(Debug, Clone, InputObject, AsChangeset)]
#[diesel(table_name = assignment_submissions, treat_none_as_null = true)]
pub struct GradeSubmissionData {
    pub final_grade: Option<f64>,
    pub feedback: Option<String>,
    #[graphql(skip)]
    pub feedback_at: Option<i64>,
    #[graphql(skip)]
    pub allow_for_student_view_answer: bool,
    #[graphql(skip)]
    pub updated_at: i64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Enum)]
pub enum SubmissionStatus {
    InDoing,
    Submitted,
    Graded,
}

#[derive(Debug, Clone, Queryable, SimpleObject)]
#[graphql(complex)]
pub struct Submission {
    pub id: i32,
    pub assignment_id: i32,
    pub user_id: i32,
    #[graphql(skip_output)]
    pub auto_grade: Option<f64>,
    pub feedback: Option<String>,
    pub updated_at: i64,
    pub created_at: i64,
    pub document_id: Uuid,
    pub attempt_number: i32,
    #[graphql(skip_output)]
    pub final_grade: Option<f64>,
    pub start_at: i64,
    pub feedback_at: Option<i64>,
    pub allow_for_student_view_answer: bool,
    pub submit_at: Option<i64>,
    pub allow_rework: bool,
    pub test_duration: Option<i32>,
}

impl Submission {
    pub fn submission_status(&self) -> SubmissionStatus {
        if self.feedback_at.is_some() {
            return SubmissionStatus::Graded;
        }

        if self.submit_at.is_some() {
            return SubmissionStatus::Submitted;
        }

        SubmissionStatus::InDoing
    }

    pub fn insert(
        conn: &mut PgConnection,
        mut new_submission: NewSubmission,
    ) -> Result<Self, Error> {
        new_submission.update_time();
        diesel::insert_into(assignment_submissions::table)
            .values(new_submission)
            .get_result(conn)
    }

    pub fn grade_submission(
        conn: &mut PgConnection,
        submission_id: i32,
        mut grade_data: GradeSubmissionData,
    ) -> Result<Self, Error> {
        grade_data.updated_at = get_now_as_secs();
        grade_data.feedback_at = Some(get_now_as_secs());
        grade_data.allow_for_student_view_answer = true;
        diesel::update(assignment_submissions::table.find(submission_id))
            .set(grade_data)
            .get_result(conn)
    }

    pub fn redo(conn: &mut PgConnection, submission_id: i32) -> Result<Self, Error> {
        diesel::update(assignment_submissions::table.find(submission_id))
            .set((
                assignment_submissions::start_at.eq(get_now_as_secs()),
                assignment_submissions::submit_at.eq(None::<i64>),
                assignment_submissions::feedback_at.eq(None::<i64>),
                assignment_submissions::allow_for_student_view_answer.eq(false),
                assignment_submissions::updated_at.eq(get_now_as_secs()),
            ))
            .get_result(conn)
    }

    pub fn request_redo(conn: &mut PgConnection, submission_id: i32) -> Result<Self, Error> {
        diesel::update(assignment_submissions::table.find(submission_id))
            .set((
                assignment_submissions::allow_for_student_view_answer.eq(false),
                assignment_submissions::allow_rework.eq(true),
                assignment_submissions::feedback_at.eq(None::<i64>),
                assignment_submissions::updated_at.eq(get_now_as_secs()),
            ))
            .get_result(conn)
    }

    pub fn reset_attempt(
        conn: &mut PgConnection,
        submission_id: i32,
        attempt_number: i32,
        document_id: Uuid,
        allow_rework: bool,
    ) -> Result<Self, Error> {
        diesel::update(assignment_submissions::table.find(submission_id))
            .set((
                assignment_submissions::attempt_number.eq(attempt_number),
                assignment_submissions::document_id.eq(document_id),
                assignment_submissions::updated_at.eq(get_now_as_secs()),
                assignment_submissions::auto_grade.eq(None::<f64>),
                assignment_submissions::feedback.eq(None::<String>),
                assignment_submissions::start_at.eq(get_now_as_secs()),
                assignment_submissions::submit_at.eq(None::<i64>),
                assignment_submissions::feedback_at.eq(None::<i64>),
                assignment_submissions::allow_rework.eq(allow_rework),
                assignment_submissions::allow_for_student_view_answer.eq(false),
            ))
            .get_result(conn)
    }

    pub fn submit(
        conn: &mut PgConnection,
        submission_id: i32,
        grade: f64,
        final_grade: f64,
        is_auto_grade: bool,
    ) -> Result<(), Error> {
        let (feedback_at, feedback) = if is_auto_grade {
            (Some(get_now_as_secs()), Some("Auto feedback"))
        } else {
            (None, None)
        };
        diesel::update(assignment_submissions::table.find(submission_id))
            .set((
                assignment_submissions::auto_grade.eq(grade),
                assignment_submissions::final_grade.eq(final_grade),
                assignment_submissions::submit_at.eq(get_now_as_secs()),
                assignment_submissions::updated_at.eq(get_now_as_secs()),
                assignment_submissions::allow_rework.eq(false),
                assignment_submissions::allow_for_student_view_answer.eq(is_auto_grade),
                assignment_submissions::feedback_at.eq(feedback_at),
                assignment_submissions::feedback.eq(feedback),
            ))
            .execute(conn)?;
        Ok(())
    }

    pub fn update_final_grade(
        conn: &mut PgConnection,
        submission_id: i32,
        final_grade: f64,
    ) -> Result<(), Error> {
        diesel::update(assignment_submissions::table.find(submission_id))
            .set((
                assignment_submissions::final_grade.eq(final_grade),
                assignment_submissions::updated_at.eq(get_now_as_secs()),
            ))
            .execute(conn)?;
        Ok(())
    }

    pub fn find_by_id(conn: &mut PgConnection, submission_id: i32) -> Result<Submission, Error> {
        assignment_submissions::table
            .find(submission_id)
            .first(conn)
    }

    pub fn find_all_by_assignment_and_user(
        conn: &mut PgConnection,
        user_id: i32,
        assignment_id: i32,
    ) -> Result<Vec<Submission>, Error> {
        assignment_submissions::table
            .filter(assignment_submissions::assignment_id.eq(assignment_id))
            .filter(assignment_submissions::user_id.eq(user_id))
            .order_by(assignment_submissions::attempt_number.desc())
            .get_results(conn)
    }

    pub fn find_last_submission(
        conn: &mut PgConnection,
        user_id: i32,
        assignment_id: i32,
    ) -> Result<Option<Submission>, Error> {
        let mut items: Vec<Self> = assignment_submissions::table
            .filter(assignment_submissions::assignment_id.eq(assignment_id))
            .filter(assignment_submissions::user_id.eq(user_id))
            .order_by(assignment_submissions::attempt_number.desc())
            .offset(0)
            .limit(1)
            .get_results(conn)?;

        Ok(items.pop())
    }

    pub fn find_by_document(
        conn: &mut PgConnection,
        document_id: Uuid,
    ) -> Result<Option<Self>, Error> {
        match assignment_submissions::table
            .filter(assignment_submissions::document_id.eq(document_id))
            .first(conn)
        {
            Ok(item) => Ok(Some(item)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn find_by_documents(
        conn: &mut PgConnection,
        document_ids: &Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        assignment_submissions::table
            .filter(assignment_submissions::document_id.eq_any(document_ids))
            .get_results(conn)
    }

    pub fn find_all_by_assignment(
        conn: &mut PgConnection,
        assignment_id: i32,
    ) -> Result<Vec<Self>, Error> {
        assignment_submissions::table
            .filter(assignment_submissions::assignment_id.eq(assignment_id))
            .get_results(conn)
    }

    pub fn find_all_by_assignments(
        conn: &mut PgConnection,
        assignment_ids: Vec<i32>,
    ) -> Result<Vec<Self>, Error> {
        assignment_submissions::table
            .filter(assignment_submissions::assignment_id.eq_any(assignment_ids))
            .get_results(conn)
    }

    pub fn find_all_by_ids(conn: &mut PgConnection, ids: Vec<i32>) -> Result<Vec<Self>, Error> {
        assignment_submissions::table
            .filter(assignment_submissions::id.eq_any(ids))
            .get_results(conn)
    }
}
