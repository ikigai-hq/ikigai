use oso::PolarClass;
use strum_macros::{Display, EnumString};
use uuid::Uuid;

use crate::db::Rubric;

#[derive(Clone, Debug, PolarClass)]
pub struct RubricAuth {
    #[polar(attribute)]
    pub id: Uuid,
    #[polar(attribute)]
    pub user_id: i32,
}

impl RubricAuth {
    pub fn new(rubric: &Rubric) -> Self {
        Self {
            id: rubric.id,
            user_id: rubric.user_id,
        }
    }
}

#[derive(Enum, Debug, Copy, Clone, Eq, PartialEq, EnumString, Display)]
#[strum(serialize_all = "snake_case")]
pub enum RubricActionPermission {
    ManageRubric,
}
