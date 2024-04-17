use diesel::result::Error;
use diesel::{AsChangeset, ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::spaces;
use crate::db::schema::space_members;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Insertable, InputObject)]
#[table_name = "spaces"]
pub struct NewSpace {
    pub name: String,
    #[graphql(skip)]
    pub updated_at: i64,
    #[graphql(skip)]
    pub created_at: i64,
    #[graphql(skip)]
    pub banner_id: Option<Uuid>,
    #[graphql(skip)]
    pub org_id: i32,
    #[graphql(skip)]
    pub creator_id: i32,
}

impl From<Space> for NewSpace {
    fn from(space: Space) -> Self {
        Self {
            name: space.name,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
            org_id: space.org_id,
            banner_id: space.banner_id,
            creator_id: space.creator_id,
        }
    }
}

impl NewSpace {
    pub fn update_time(&mut self) {
        self.updated_at = get_now_as_secs();
        self.created_at = get_now_as_secs();
    }
}

#[derive(Debug, Clone, AsChangeset, InputObject)]
#[table_name = "spaces"]
#[changeset_options(treat_none_as_null = "true")]
pub struct UpdateSpaceData {
    pub name: String,
    pub banner_id: Option<Uuid>,
    #[graphql(skip)]
    pub updated_at: i64,
}

#[derive(Debug, Clone, Queryable, SimpleObject)]
#[graphql(complex)]
pub struct Space {
    pub id: i32,
    pub name: String,
    pub updated_at: i64,
    pub created_at: i64,
    pub org_id: i32,
    pub banner_id: Option<Uuid>,
    pub creator_id: i32,
    pub deleted_at: Option<i64>,
}

impl Space {
    pub fn insert(conn: &PgConnection, mut new_space: NewSpace) -> Result<Self, Error> {
        new_space.update_time();
        diesel::insert_into(spaces::table)
            .values(new_space)
            .get_result(conn)
    }

    pub fn update(
        conn: &PgConnection,
        space_id: i32,
        mut data: UpdateSpaceData,
    ) -> Result<Self, Error> {
        data.updated_at = get_now_as_secs();
        diesel::update(spaces::table.find(space_id))
            .set(data)
            .get_result(conn)
    }

    pub fn find_by_id(conn: &PgConnection, space_id: i32) -> Result<Self, Error> {
        spaces::table.find(space_id).first(conn)
    }

    pub fn find_all_by_ids(conn: &PgConnection, space_ids: Vec<i32>) -> Result<Vec<Self>, Error> {
        spaces::table
            .filter(spaces::id.eq_any(space_ids))
            .get_results(conn)
    }

    pub fn find_all_deleted_spaces(conn: &PgConnection, org_id: i32) -> Result<Vec<Self>, Error> {
        let sixty_days_ago = get_now_as_secs() - 5_184_000;
        spaces::table
            .filter(spaces::org_id.eq(org_id))
            .filter(spaces::deleted_at.gt(sixty_days_ago))
            .get_results(conn)
    }

    pub fn find_all_org_spaces(conn: &PgConnection, org_id: i32) -> Result<Vec<Self>, Error> {
        spaces::table
            .filter(spaces::org_id.eq(org_id))
            .filter(spaces::deleted_at.is_null())
            .order_by(spaces::name.asc())
            .get_results(conn)
    }

    pub fn find_my_spaces(
        conn: &PgConnection,
        org_id: i32,
        user_id: i32,
    ) -> Result<Vec<Self>, Error> {
        spaces::table
            .inner_join(space_members::table)
            .select(spaces::all_columns)
            .filter(space_members::user_id.eq(user_id))
            .filter(spaces::org_id.eq(org_id))
            .order_by(spaces::created_at.desc())
            .get_results(conn)
    }

    pub fn find_all_by_owner(conn: &PgConnection, user_id: i32) -> Result<Vec<Self>, Error> {
        spaces::table
            .filter(spaces::creator_id.eq(user_id))
            .get_results(conn)
    }

    pub fn soft_remove(conn: &PgConnection, space_id: i32) -> Result<(), Error> {
        diesel::update(spaces::table.find(space_id))
            .set((
                spaces::deleted_at.eq(get_now_as_secs()),
                spaces::updated_at.eq(get_now_as_secs()),
            ))
            .execute(conn)?;
        Ok(())
    }

    pub fn restore(conn: &PgConnection, space_id: i32) -> Result<Self, Error> {
        let item = diesel::update(spaces::table.find(space_id))
            .set((
                spaces::deleted_at.eq(None::<i64>),
                spaces::updated_at.eq(get_now_as_secs()),
            ))
            .get_result(conn)?;
        Ok(item)
    }

    pub fn remove(conn: &PgConnection, space_id: i32) -> Result<(), Error> {
        diesel::delete(spaces::table.find(space_id)).execute(conn)?;
        Ok(())
    }
}