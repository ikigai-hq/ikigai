use oso::PolarClass;
use strum_macros::{Display, EnumString};

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

#[derive(Enum, Debug, Copy, Clone, Eq, PartialEq, EnumString, Display)]
#[strum(serialize_all = "snake_case")]
pub enum SpaceActionPermission {
    ViewSpaceContent,
    ManageSpaceContent,
    ManageSpaceMember,
    ManageSpaceSetting,
}
