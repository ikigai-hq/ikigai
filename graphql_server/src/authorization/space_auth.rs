use oso::PolarClass;
use std::fmt::{Display, Formatter};

use crate::db::Space;

#[derive(Clone, Debug, PolarClass)]
pub struct SpaceAuth {
    #[polar(attribute)]
    pub id: i32,
    #[polar(attribute)]
    pub creator_id: i32,
}

impl SpaceAuth {
    pub fn new(space: &Space) -> Self {
        Self {
            id: space.id,
            creator_id: space.creator_id,
        }
    }
}

#[derive(Enum, Debug, Copy, Clone, Eq, PartialEq)]
pub enum SpaceActionPermission {
    ViewSpaceContent,
    ManageSpaceContent,
    ManageSpaceMember,
    ManageSpaceSetting,
}

impl Display for SpaceActionPermission {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let permission = match self {
            Self::ViewSpaceContent => "view_space_content",
            Self::ManageSpaceContent => "manage_space_content",
            Self::ManageSpaceMember => "manage_space_member",
            Self::ManageSpaceSetting => "manage_space_setting",
        };
        write!(f, "{permission}")
    }
}
