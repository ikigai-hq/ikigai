use diesel::PgConnection;
use oso::PolarClass;

use crate::db::{SpaceMember};
use crate::error::IkigaiError;

#[derive(Clone, Debug, PolarClass, SimpleObject)]
pub struct UserAuth {
    #[polar(attribute)]
    pub id: i32,
    #[polar(attribute)]
    pub org_id: i32,
    #[polar(attribute)]
    pub space_ids: Vec<i32>,
}

impl UserAuth {
    pub fn init_dummy() -> Self {
        Self {
            id: 0,
            org_id: 0,
            space_ids: vec![],
        }
    }

    pub fn new(conn: &PgConnection) -> Result<Self, IkigaiError> {
        let space_ids = SpaceMember::find_all_by_user(conn, member.user_id)?
            .into_iter()
            .map(|m| m.space_id)
            .collect();
        Ok(Self {
            id: member.user_id,
            org_id: member.org_id,
            org_role: member.org_role,
            space_ids,
        })
    }
}
