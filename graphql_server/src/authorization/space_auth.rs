use oso::PolarClass;
use std::fmt::{Display, Formatter};

use crate::db::Space;

#[derive(Clone, Debug, PolarClass)]
pub struct SpaceAuth {
    #[polar(attribute)]
    pub id: i32,
    #[polar(attribute)]
    pub allow_student_self_enroll: bool,
    #[polar(attribute)]
    pub org_id: i32,
}

impl SpaceAuth {
    pub fn new(space: &Space) -> Self {
        Self {
            id: space.id,
            org_id: space.org_id,
            allow_student_self_enroll: false,
        }
    }
}

#[derive(Enum, Debug, Copy, Clone, Eq, PartialEq)]
pub enum SpaceActionPermission {
    ViewSpaceContent,
    SelfEnroll,
    ManageSpaceContent,
    ManageSpaceMember,
    ManageSpaceSetting,
}

impl Display for SpaceActionPermission {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let permission = match self {
            Self::ViewSpaceContent => "view_space_content",
            Self::SelfEnroll => "self_enroll",
            Self::ManageSpaceContent => "manage_space_content",
            Self::ManageSpaceMember => "manage_space_member",
            Self::ManageSpaceSetting => "manage_space_setting",
        };
        write!(f, "{permission}")
    }
}
