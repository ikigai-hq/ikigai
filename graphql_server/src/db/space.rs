use diesel::result::Error;
use diesel::{AsChangeset, ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::spaces;
use crate::db::schema::{space_invite_tokens, space_members};
use crate::db::Role;
use crate::util::{generate_code, get_now_as_secs};

#[derive(Debug, Clone, Insertable, InputObject)]
#[diesel(table_name = spaces)]
pub struct NewSpace {
    pub name: String,
    #[graphql(skip)]
    pub updated_at: i64,
    #[graphql(skip)]
    pub created_at: i64,
    #[graphql(skip)]
    pub banner_id: Option<Uuid>,
    #[graphql(skip)]
    pub creator_id: i32,
}

impl From<Space> for NewSpace {
    fn from(space: Space) -> Self {
        Self {
            name: space.name,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
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
#[diesel(table_name = spaces, treat_none_as_null = true)]
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
    pub banner_id: Option<Uuid>,
    pub creator_id: i32,
    pub deleted_at: Option<i64>,
}

impl Space {
    pub fn insert(conn: &mut PgConnection, mut new_space: NewSpace) -> Result<Self, Error> {
        new_space.update_time();
        diesel::insert_into(spaces::table)
            .values(new_space)
            .get_result(conn)
    }

    pub fn update(
        conn: &mut PgConnection,
        space_id: i32,
        mut data: UpdateSpaceData,
    ) -> Result<Self, Error> {
        data.updated_at = get_now_as_secs();
        diesel::update(spaces::table.find(space_id))
            .set(data)
            .get_result(conn)
    }

    pub fn find_by_id(conn: &mut PgConnection, space_id: i32) -> Result<Self, Error> {
        spaces::table.find(space_id).first(conn)
    }

    pub fn find_all_by_ids(
        conn: &mut PgConnection,
        space_ids: Vec<i32>,
    ) -> Result<Vec<Self>, Error> {
        spaces::table
            .filter(spaces::id.eq_any(space_ids))
            .get_results(conn)
    }

    pub fn find_my_spaces(conn: &mut PgConnection, user_id: i32) -> Result<Vec<Self>, Error> {
        spaces::table
            .inner_join(space_members::table)
            .select(spaces::all_columns)
            .filter(space_members::user_id.eq(user_id))
            .order_by(spaces::created_at.desc())
            .get_results(conn)
    }

    pub fn find_all_by_owner(conn: &mut PgConnection, user_id: i32) -> Result<Vec<Self>, Error> {
        spaces::table
            .filter(spaces::creator_id.eq(user_id))
            .get_results(conn)
    }

    pub fn soft_remove(conn: &mut PgConnection, space_id: i32) -> Result<(), Error> {
        diesel::update(spaces::table.find(space_id))
            .set((
                spaces::deleted_at.eq(get_now_as_secs()),
                spaces::updated_at.eq(get_now_as_secs()),
            ))
            .execute(conn)?;
        Ok(())
    }

    pub fn restore(conn: &mut PgConnection, space_id: i32) -> Result<Self, Error> {
        let item = diesel::update(spaces::table.find(space_id))
            .set((
                spaces::deleted_at.eq(None::<i64>),
                spaces::updated_at.eq(get_now_as_secs()),
            ))
            .get_result(conn)?;
        Ok(item)
    }

    pub fn remove(conn: &mut PgConnection, space_id: i32) -> Result<(), Error> {
        diesel::delete(spaces::table.find(space_id)).execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[diesel(table_name = space_invite_tokens)]
#[graphql(input_name = "SpaceInviteTokenInput", complex)]
pub struct SpaceInviteToken {
    pub space_id: i32,
    #[graphql(skip_input)]
    pub token: String,
    #[graphql(skip_input)]
    pub creator_id: i32,
    pub inviting_role: Role,
    pub expire_at: Option<i64>,
    #[graphql(skip_input)]
    pub uses: i32,
    #[graphql(skip_input)]
    pub is_active: bool,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl SpaceInviteToken {
    pub fn upsert(conn: &mut PgConnection, mut item: Self) -> Result<Self, Error> {
        item.is_active = true;
        item.created_at = get_now_as_secs();
        item.token = generate_code();

        diesel::insert_into(space_invite_tokens::table)
            .values(&item)
            .on_conflict_do_nothing()
            .execute(conn)?;

        Ok(item)
    }

    pub fn increase_use(
        conn: &mut PgConnection,
        space_id: i32,
        token: &str,
    ) -> Result<Self, Error> {
        diesel::update(space_invite_tokens::table.find((space_id, token)))
            .set(space_invite_tokens::uses.eq(space_invite_tokens::uses + 1))
            .get_result(conn)
    }

    pub fn set_active(
        conn: &mut PgConnection,
        space_id: i32,
        token: String,
        is_active: bool,
    ) -> Result<Self, Error> {
        diesel::update(space_invite_tokens::table.find((space_id, token)))
            .set(space_invite_tokens::is_active.eq(is_active))
            .get_result(conn)
    }

    pub fn find(conn: &mut PgConnection, space_id: i32, token: &str) -> Result<Self, Error> {
        space_invite_tokens::table
            .find((space_id, token))
            .get_result(conn)
    }

    pub fn find_all_by_spaces(conn: &mut PgConnection, space_id: i32) -> Result<Vec<Self>, Error> {
        space_invite_tokens::table
            .filter(space_invite_tokens::space_id.eq(space_id))
            .order_by(space_invite_tokens::created_at.desc())
            .get_results(conn)
    }

    pub fn remove(conn: &mut PgConnection, space_id: i32, token: String) -> Result<(), Error> {
        diesel::delete(space_invite_tokens::table.find((space_id, token))).execute(conn)?;
        Ok(())
    }
}
