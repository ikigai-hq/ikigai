use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{AsChangeset, ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::assignments;
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[diesel(sql_type = Integer)]
pub enum GradeMethod {
    Manual,
    Auto,
    Rubric,
}

impl_enum_for_db!(GradeMethod);

impl Default for GradeMethod {
    fn default() -> Self {
        Self::Manual
    }
}

#[derive(Debug, Clone, Insertable, Default)]
#[diesel(table_name = assignments)]
pub struct NewAssignment {
    pub updated_at: i64,
    pub created_at: i64,
    pub document_id: Uuid,
    pub max_number_of_attempt: Option<i32>,
    pub pre_description: Option<String>,
    pub test_duration: Option<i32>,
    pub band_score_id: Option<i32>,
    pub grade_method: GradeMethod,
    pub force_auto_submit: bool,
    pub grade_by_rubric_id: Option<Uuid>,
}

impl From<Assignment> for NewAssignment {
    fn from(assignment: Assignment) -> Self {
        Self {
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
            document_id: assignment.document_id,
            max_number_of_attempt: assignment.max_number_of_attempt,
            pre_description: assignment.pre_description,
            test_duration: assignment.test_duration,
            band_score_id: assignment.band_score_id,
            grade_method: assignment.grade_method,
            force_auto_submit: assignment.force_auto_submit,
            grade_by_rubric_id: assignment.grade_by_rubric_id,
        }
    }
}

impl NewAssignment {
    pub fn init(document_id: Uuid) -> Self {
        Self {
            document_id,
            ..Default::default()
        }
    }

    pub fn update_time(&mut self) {
        self.updated_at = get_now_as_secs();
        self.created_at = get_now_as_secs();
    }
}

#[derive(Debug, Clone, Insertable, InputObject, AsChangeset)]
#[diesel(table_name = assignments, treat_none_as_null = true)]
pub struct UpdateAssignmentData {
    pub max_number_of_attempt: Option<i32>,
    pub pre_description: Option<String>,
    pub test_duration: Option<i32>,
    pub band_score_id: Option<i32>,
    pub grade_method: GradeMethod,
    pub force_auto_submit: bool,
    pub grade_by_rubric_id: Option<Uuid>,
    #[graphql(skip)]
    pub updated_at: i64,
}

#[derive(Debug, Clone, Queryable, SimpleObject)]
#[graphql(complex)]
pub struct Assignment {
    pub id: i32,
    pub updated_at: i64,
    pub created_at: i64,
    pub document_id: Uuid,
    pub max_number_of_attempt: Option<i32>,
    pub pre_description: Option<String>,
    pub test_duration: Option<i32>,
    pub band_score_id: Option<i32>,
    pub grade_method: GradeMethod,
    pub force_auto_submit: bool,
    pub grade_by_rubric_id: Option<Uuid>,
}

impl Assignment {
    pub fn insert(
        conn: &mut PgConnection,
        mut new_assignment: NewAssignment,
    ) -> Result<Self, Error> {
        new_assignment.update_time();
        diesel::insert_into(assignments::table)
            .values(new_assignment)
            .get_result(conn)
    }

    pub fn batch_insert(
        conn: &mut PgConnection,
        new_assignments: Vec<NewAssignment>,
    ) -> Result<Vec<Self>, Error> {
        diesel::insert_into(assignments::table)
            .values(new_assignments)
            .get_results(conn)
    }

    pub fn update(
        conn: &mut PgConnection,
        assignment_id: i32,
        mut update_data: UpdateAssignmentData,
    ) -> Result<Self, Error> {
        update_data.updated_at = get_now_as_secs();
        diesel::update(assignments::table.find(assignment_id))
            .set(update_data)
            .get_result(conn)
    }

    pub fn find_by_id(conn: &mut PgConnection, assignment_id: i32) -> Result<Self, Error> {
        assignments::table.find(assignment_id).first(conn)
    }

    pub fn find_by_document(
        conn: &mut PgConnection,
        document_id: Uuid,
    ) -> Result<Option<Self>, Error> {
        match assignments::table
            .filter(assignments::document_id.eq(document_id))
            .first(conn)
        {
            Ok(item) => Ok(Some(item)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn find_all_by_documents(
        conn: &mut PgConnection,
        document_ids: &Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        assignments::table
            .filter(assignments::document_id.eq_any(document_ids))
            .get_results(conn)
    }

    pub fn find_all_by_ids(
        conn: &mut PgConnection,
        assignment_ids: Vec<i32>,
    ) -> Result<Vec<Self>, Error> {
        assignments::table
            .filter(assignments::id.eq_any(assignment_ids))
            .get_results(conn)
    }
}
