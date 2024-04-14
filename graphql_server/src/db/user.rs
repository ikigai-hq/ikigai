use diesel::dsl::any;
use diesel::result::Error;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use oso::PolarClass;
use uuid::Uuid;

use super::schema::users;

#[derive(Debug, Insertable)]
#[table_name = "users"]
pub struct NewUser {
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub avatar_file_id: Option<Uuid>,
}

impl NewUser {
    pub fn new(email: String, first_name: String, last_name: String) -> NewUser {
        NewUser {
            email: email.to_lowercase(),
            first_name,
            last_name,
            avatar_file_id: None,
        }
    }
}

#[derive(Debug, Clone, InputObject, AsChangeset)]
#[table_name = "users"]
#[changeset_options(treat_none_as_null = "true")]
pub struct UpdateUserData {
    #[graphql(validator(max_length = 256))]
    pub first_name: String,
    #[graphql(validator(max_length = 256))]
    pub last_name: String,
    pub avatar_file_id: Option<Uuid>,
}

impl From<User> for UpdateUserData {
    fn from(user: User) -> Self {
        Self {
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_file_id: user.avatar_file_id,
        }
    }
}

#[derive(Debug, Clone, SimpleObject, Eq)]
#[graphql(complex)]
pub struct PublicUser {
    pub id: i32,
    pub first_name: String,
    pub last_name: String,
    #[graphql(skip_output)]
    pub email: String,
    pub avatar_file_id: Option<Uuid>,
    pub updated_at: i64,
    pub created_at: i64,
}

impl PartialEq for PublicUser {
    fn eq(&self, other: &PublicUser) -> bool {
        self.id == other.id
    }
}

impl From<User> for PublicUser {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            avatar_file_id: user.avatar_file_id,
            updated_at: user.updated_at,
            created_at: user.created_at,
        }
    }
}

/// Support for get info of current user
#[derive(Debug, Clone, Queryable, SimpleObject, PolarClass)]
#[graphql(complex)]
pub struct User {
    #[polar(attribute)]
    pub id: i32,
    #[graphql(skip_output)]
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub updated_at: i64,
    pub created_at: i64,
    pub avatar_file_id: Option<Uuid>,
}

impl User {
    pub fn insert(conn: &PgConnection, user: &NewUser) -> Result<Self, Error> {
        diesel::insert_into(users::table)
            .values(user)
            .get_result(conn)
    }

    pub fn find_by_id(conn: &PgConnection, id: i32) -> Result<Self, Error> {
        users::table.find(id).first(conn)
    }

    pub fn find_by_email(conn: &PgConnection, email: &str) -> Result<Self, Error> {
        users::table
            .filter(users::email.eq(&email.to_lowercase()))
            .first(conn)
    }

    pub fn find_by_email_opt(conn: &PgConnection, email: &str) -> Result<Option<Self>, Error> {
        match Self::find_by_email(conn, email) {
            Ok(user) => Ok(Some(user)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn find_by_ids(conn: &PgConnection, ids: &Vec<i32>) -> Result<Vec<User>, Error> {
        users::table.filter(users::id.eq(any(ids))).load(conn)
    }

    pub fn update_info(conn: &PgConnection, id: i32, info: UpdateUserData) -> Result<(), Error> {
        diesel::update(users::table.find(id))
            .set(info)
            .execute(conn)?;

        Ok(())
    }

    pub fn name(&self) -> String {
        format!("{} {}", self.first_name, self.last_name)
    }
}
