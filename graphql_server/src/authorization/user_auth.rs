use oso::PolarClass;

use crate::db::{OrgRole, OrganizationMember};

#[derive(Clone, Debug, PolarClass)]
pub struct UserAuth {
    #[polar(attribute)]
    pub id: i32,
    #[polar(attribute)]
    pub org_id: i32,
    pub org_role: OrgRole,
}

impl From<OrganizationMember> for UserAuth {
    fn from(member: OrganizationMember) -> Self {
        Self {
            id: member.user_id,
            org_id: member.org_id,
            org_role: member.org_role,
        }
    }
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
        }
    }
}
