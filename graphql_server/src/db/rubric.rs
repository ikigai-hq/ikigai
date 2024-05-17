use diesel::result::Error;
use diesel::sql_types::Jsonb;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::{rubric_submissions, rubrics};
use crate::impl_jsonb_for_db;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize, Enum)]
pub enum RubricType {
    PointBased,
    PointRange,
}

impl Default for RubricType {
    fn default() -> Self {
        Self::PointBased
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, SimpleObject, InputObject)]
#[graphql(input_name = "RubricUserPickedInput")]
pub struct RubricUserPick {
    pub selected: bool,
    pub score: f64,
    pub comment: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, SimpleObject, InputObject)]
#[graphql(input_name = "RubricTableItemInput")]
pub struct RubricTableItem {
    pub explanation: String,
    // Point Based -> Score
    // Point Range -> from_score
    pub score: f64,
    #[serde(default)]
    pub to_score: f64,
    #[serde(default)]
    pub user_pick: RubricUserPick,
}

#[derive(
    Debug,
    Clone,
    Default,
    Serialize,
    Deserialize,
    SimpleObject,
    InputObject,
    AsExpression,
    FromSqlRow,
)]
#[diesel(sql_type = Jsonb)]
#[graphql(input_name = "RubricTableDataInput", complex)]
pub struct RubricTableData {
    #[serde(default)]
    pub rubric_type: RubricType,
    pub criteria: Vec<String>,
    #[serde(default)]
    pub weighting_criteria: Vec<Option<f64>>,
    pub level: Vec<String>,
    // [Criteria][Level]
    pub items: Vec<Vec<RubricTableItem>>,
}

impl RubricTableData {
    pub fn total_rubric_score(&self) -> f64 {
        let mut score = 0.0;

        for (index, inner_items) in self.items.iter().enumerate() {
            let percentage = self
                .weighting_criteria
                .get(index)
                .unwrap_or(&Some(1.0))
                .unwrap_or(1.0);
            for item in inner_items {
                if item.user_pick.selected {
                    score += item.user_pick.score * percentage;
                }
            }
        }

        score
    }
}

impl_jsonb_for_db!(RubricTableData);

#[derive(Debug, Clone, Insertable, Queryable, InputObject, SimpleObject)]
#[diesel(table_name = rubrics)]
#[graphql(input_name = "RubricInput")]
pub struct Rubric {
    pub id: Uuid,
    pub name: String,
    pub data: RubricTableData,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
    #[graphql(skip_input)]
    pub user_id: i32,
}

impl Rubric {
    pub fn upsert(conn: &mut PgConnection, mut item: Self) -> Result<Self, Error> {
        item.updated_at = get_now_as_secs();
        item.created_at = get_now_as_secs();
        diesel::insert_into(rubrics::table)
            .values(&item)
            .on_conflict(rubrics::id)
            .do_update()
            .set((
                rubrics::updated_at.eq(item.updated_at),
                rubrics::name.eq(&item.name),
                rubrics::data.eq(&item.data),
            ))
            .get_result(conn)
    }

    pub fn find_by_id(conn: &mut PgConnection, rubric_id: Uuid) -> Result<Self, Error> {
        rubrics::table.find(rubric_id).first(conn)
    }

    pub fn find_all_by_user(conn: &mut PgConnection, user_id: i32) -> Result<Vec<Self>, Error> {
        rubrics::table
            .filter(rubrics::user_id.eq(user_id))
            .get_results(conn)
    }

    pub fn remove(conn: &mut PgConnection, rubric_id: Uuid) -> Result<(), Error> {
        diesel::delete(rubrics::table.find(rubric_id)).execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, Insertable, Queryable, InputObject, SimpleObject)]
#[diesel(table_name = rubric_submissions)]
#[graphql(input_name = "RubricSubmissionInput")]
pub struct RubricSubmission {
    pub submission_id: i32,
    pub rubric_id: Option<Uuid>,
    pub graded_data: RubricTableData,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl RubricSubmission {
    pub fn new(submission_id: i32, rubric_id: Uuid, graded_data: RubricTableData) -> Self {
        Self {
            submission_id,
            rubric_id: Some(rubric_id),
            graded_data,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
        }
    }

    pub fn upsert(conn: &mut PgConnection, mut item: Self) -> Result<Self, Error> {
        item.updated_at = get_now_as_secs();
        item.created_at = get_now_as_secs();
        diesel::insert_into(rubric_submissions::table)
            .values(&item)
            .on_conflict(rubric_submissions::submission_id)
            .do_update()
            .set((
                rubric_submissions::updated_at.eq(&item.updated_at),
                rubric_submissions::graded_data.eq(&item.graded_data),
            ))
            .get_result(conn)
    }

    pub fn find_by_submission(conn: &mut PgConnection, submission_id: i32) -> Result<Self, Error> {
        rubric_submissions::table.find(submission_id).first(conn)
    }

    pub fn find_by_submission_opt(
        conn: &mut PgConnection,
        submission_id: i32,
    ) -> Result<Option<Self>, Error> {
        match Self::find_by_submission(conn, submission_id) {
            Ok(item) => Ok(Some(item)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }
}
