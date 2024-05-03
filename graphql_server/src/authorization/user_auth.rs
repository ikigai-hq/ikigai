use oso::PolarClass;

use crate::db::{Role, SpaceMember};

#[derive(Clone, Debug, PolarClass, SimpleObject)]
pub struct UserAuth {
    #[polar(attribute)]
    pub id: i32,
    #[polar(attribute)]
    pub space_id: i32,
    pub role: Role,
}

impl UserAuth {
    pub fn init_dummy() -> Self {
        Self {
            id: 0,
            space_id: 0,
            role: Role::Student,
        }
    }

    pub fn get_role(&self) -> String {
        match self.role {
            Role::Teacher => "Teacher",
            Role::Student => "Student",
        }
        .to_string()
    }

    pub fn new(space_member: SpaceMember) -> Self {
        Self {
            id: space_member.user_id,
            space_id: space_member.space_id,
            role: space_member.role,
        }
    }
}
