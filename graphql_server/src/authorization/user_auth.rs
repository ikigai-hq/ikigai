use diesel::PgConnection;
use oso::PolarClass;

use crate::db::{OrgRole, OrganizationMember, SpaceMember};
use crate::error::OpenAssignmentError;

#[derive(Clone, Debug, PolarClass, SimpleObject)]
pub struct UserAuth {
    #[polar(attribute)]
    pub id: i32,
    #[polar(attribute)]
    pub org_id: i32,
    pub org_role: OrgRole,
    #[polar(attribute)]
    pub space_ids: Vec<i32>,
}

impl UserAuth {
    pub fn get_role(&self) -> String {
        match self.org_role {
            OrgRole::Student => "Student",
            _ => "Teacher",
        }
        .into()
    }

    pub fn init_dummy() -> Self {
        Self {
            id: 0,
            org_id: 0,
            org_role: OrgRole::Student,
            space_ids: vec![],
        }
    }

    pub fn new(conn: &PgConnection, member: OrganizationMember) -> Result<Self, OpenAssignmentError> {
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
