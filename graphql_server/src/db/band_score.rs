use diesel::result::Error;
use diesel::sql_types::Jsonb;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};

use super::schema::band_scores;
use crate::impl_jsonb_for_db;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject, InputObject)]
#[graphql(input_name = "BandScoreRangeInput")]
pub struct BandScoreRange {
    pub from: i32,
    pub to: i32,
    pub score: f64,
}

impl BandScoreRange {
    pub fn new(from: i32, to: i32, score: f64) -> Self {
        Self { from, to, score }
    }
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
#[graphql(input_name = "BandScoreRangesInput")]
#[sql_type = "Jsonb"]
pub struct BandScoreRanges {
    pub items: Vec<BandScoreRange>,
}

impl BandScoreRanges {
    pub fn init_ielts_listening() -> Self {
        let items = vec![
            BandScoreRange::new(11, 12, 4.0),
            BandScoreRange::new(13, 15, 4.5),
            BandScoreRange::new(16, 17, 5.0),
            BandScoreRange::new(18, 22, 5.5),
            BandScoreRange::new(23, 25, 6.0),
            BandScoreRange::new(26, 29, 6.5),
            BandScoreRange::new(30, 31, 7.0),
            BandScoreRange::new(32, 34, 7.5),
            BandScoreRange::new(35, 36, 8.0),
            BandScoreRange::new(37, 38, 8.5),
            BandScoreRange::new(39, 40, 9.0),
        ];
        Self { items }
    }

    pub fn init_ielts_reading_academic() -> Self {
        let items = vec![
            BandScoreRange::new(6, 7, 3.0),
            BandScoreRange::new(8, 9, 3.5),
            BandScoreRange::new(10, 12, 4.0),
            BandScoreRange::new(13, 14, 4.5),
            BandScoreRange::new(15, 18, 5.0),
            BandScoreRange::new(19, 22, 5.5),
            BandScoreRange::new(23, 26, 6.0),
            BandScoreRange::new(27, 29, 6.5),
            BandScoreRange::new(30, 32, 7.0),
            BandScoreRange::new(33, 34, 7.5),
            BandScoreRange::new(35, 36, 8.0),
            BandScoreRange::new(37, 38, 8.5),
            BandScoreRange::new(39, 40, 9.0),
        ];
        Self { items }
    }

    pub fn init_ielts_reading_general() -> Self {
        let items = vec![
            BandScoreRange::new(9, 11, 3.0),
            BandScoreRange::new(12, 14, 3.5),
            BandScoreRange::new(15, 18, 4.0),
            BandScoreRange::new(19, 22, 4.5),
            BandScoreRange::new(23, 26, 5.0),
            BandScoreRange::new(27, 29, 5.5),
            BandScoreRange::new(30, 31, 6.0),
            BandScoreRange::new(32, 33, 6.5),
            BandScoreRange::new(34, 35, 7.0),
            BandScoreRange::new(36, 36, 7.5),
            BandScoreRange::new(37, 38, 8.0),
            BandScoreRange::new(39, 39, 8.5),
            BandScoreRange::new(40, 40, 9.0),
        ];
        Self { items }
    }
}

impl_jsonb_for_db!(BandScoreRanges);

#[derive(Debug, Clone, Insertable, InputObject)]
#[table_name = "band_scores"]
pub struct NewBandScore {
    pub name: String,
    pub range: BandScoreRanges,
    #[graphql(skip)]
    pub org_id: Option<i32>,
}

impl NewBandScore {
    pub fn new(name: String, range: BandScoreRanges, org_id: Option<i32>) -> Self {
        Self {
            name,
            range,
            org_id,
        }
    }

    pub fn seed(org_id: i32) -> Vec<Self> {
        vec![
            Self::new(
                "IELTS Listening".into(),
                BandScoreRanges::init_ielts_listening(),
                Some(org_id),
            ),
            Self::new(
                "IELTS Reading (Academic)".into(),
                BandScoreRanges::init_ielts_reading_academic(),
                Some(org_id),
            ),
            Self::new(
                "IELTS Reading (General)".into(),
                BandScoreRanges::init_ielts_reading_general(),
                Some(org_id),
            ),
        ]
    }
}

#[derive(Debug, Clone, Queryable, SimpleObject)]
pub struct BandScore {
    pub id: i32,
    pub name: String,
    pub range: BandScoreRanges,
    pub org_id: Option<i32>,
    pub updated_at: i64,
    pub created_at: i64,
}

impl BandScore {
    pub fn find_score(&self, grade: f64) -> f64 {
        let item = self
            .range
            .items
            .iter()
            .find(|item| item.from as f64 <= grade && grade <= item.to as f64);
        item.map_or(grade, |range| range.score)
    }

    pub fn insert(conn: &PgConnection, new_band_score: NewBandScore) -> Result<Self, Error> {
        diesel::insert_into(band_scores::table)
            .values(new_band_score)
            .get_result(conn)
    }

    pub fn update(
        conn: &PgConnection,
        band_score_id: i32,
        range: BandScoreRanges,
    ) -> Result<(), Error> {
        diesel::update(band_scores::table.find(band_score_id))
            .set((
                band_scores::range.eq(range),
                band_scores::updated_at.eq(get_now_as_secs()),
            ))
            .execute(conn)?;
        Ok(())
    }

    pub fn find(conn: &PgConnection, band_score_id: i32) -> Result<Self, Error> {
        band_scores::table.find(band_score_id).first(conn)
    }

    pub fn find_all_by_org_id(conn: &PgConnection, org_id: i32) -> Result<Vec<Self>, Error> {
        let mut band_scores: Vec<Self> = band_scores::table
            .filter(band_scores::org_id.is_null())
            .get_results(conn)?;
        let mut org_band_scores: Vec<Self> = band_scores::table
            .filter(band_scores::org_id.eq(org_id))
            .get_results(conn)?;

        band_scores.append(&mut org_band_scores);

        Ok(band_scores)
    }

    pub fn remove(conn: &PgConnection, band_score_id: i32) -> Result<(), Error> {
        diesel::delete(band_scores::table.find(band_score_id)).execute(conn)?;
        Ok(())
    }
}
