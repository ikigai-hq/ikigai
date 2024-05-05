use oso::PolarClass;
use std::fmt::{Display, Formatter};
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

#[derive(Enum, Debug, Copy, Clone, Eq, PartialEq)]
pub enum RubricActionPermission {
    ManageRubric,
}

impl Display for RubricActionPermission {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let permission = match self {
            Self::ManageRubric => "manage_rubric",
        };
        write!(f, "{permission}")
    }
}
