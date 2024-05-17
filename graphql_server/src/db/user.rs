use diesel::result::Error;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use oso::PolarClass;
use uuid::Uuid;

use crate::db::{Document, SpaceMember};

use super::schema::{user_activities, users};

#[derive(Debug, Insertable)]
#[diesel(table_name = users)]
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
#[diesel(table_name = users, treat_none_as_null = true)]
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
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub updated_at: i64,
    pub created_at: i64,
    pub avatar_file_id: Option<Uuid>,
}

impl User {
    pub fn insert(conn: &mut PgConnection, user: &NewUser) -> Result<Self, Error> {
        diesel::insert_into(users::table)
            .values(user)
            .get_result(conn)
    }

    pub fn batch_insert(
        conn: &mut PgConnection,
        new_users: Vec<NewUser>,
    ) -> Result<Vec<Self>, Error> {
        diesel::insert_into(users::table)
            .values(new_users)
            .get_results(conn)
    }

    pub fn find_by_id(conn: &mut PgConnection, id: i32) -> Result<Self, Error> {
        users::table.find(id).first(conn)
    }

    pub fn find_by_email(conn: &mut PgConnection, email: &str) -> Result<Self, Error> {
        users::table
            .filter(users::email.eq(&email.to_lowercase()))
            .first(conn)
    }

    pub fn find_by_emails(
        conn: &mut PgConnection,
        emails: &Vec<String>,
    ) -> Result<Vec<Self>, Error> {
        users::table
            .filter(users::email.eq_any(emails))
            .get_results(conn)
    }

    pub fn find_by_email_opt(conn: &mut PgConnection, email: &str) -> Result<Option<Self>, Error> {
        match Self::find_by_email(conn, email) {
            Ok(user) => Ok(Some(user)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn find_by_ids(conn: &mut PgConnection, ids: &Vec<i32>) -> Result<Vec<User>, Error> {
        users::table.filter(users::id.eq_any(ids)).get_results(conn)
    }

    pub fn update_info(
        conn: &mut PgConnection,
        id: i32,
        info: UpdateUserData,
    ) -> Result<(), Error> {
        diesel::update(users::table.find(id))
            .set(info)
            .execute(conn)?;

        Ok(())
    }

    pub fn name(&self) -> String {
        format!("{} {}", self.first_name, self.last_name)
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject)]
#[diesel(table_name = user_activities)]
pub struct UserActivity {
    pub user_id: i32,
    pub last_document_id: Option<Uuid>,
}

impl UserActivity {
    pub fn insert(conn: &mut PgConnection, user_id: i32, document_id: Uuid) -> Result<Self, Error> {
        let item = Self {
            user_id,
            last_document_id: Some(document_id),
        };
        diesel::insert_into(user_activities::table)
            .values(&item)
            .on_conflict(user_activities::user_id)
            .do_update()
            .set(user_activities::last_document_id.eq(&item.last_document_id))
            .get_result(conn)
    }

    pub fn find(conn: &mut PgConnection, user_id: i32) -> Result<Self, Error> {
        user_activities::table.find(user_id).first(conn)
    }

    pub fn find_or_insert(conn: &mut PgConnection, user_id: i32) -> Result<Self, Error> {
        if let Ok(activity) = Self::find(conn, user_id) {
            Ok(activity)
        } else {
            // Insert a default
            let mut space_members = SpaceMember::find_all_by_user(conn, user_id)?;
            if space_members.is_empty() {
                return Err(Error::NotFound);
            }

            let first_member = space_members.remove(0);
            let document = Document::find_starter_of_space(conn, first_member.space_id)?
                .ok_or(Error::NotFound)?;

            Self::insert(conn, user_id, document.id)
        }
    }
}
