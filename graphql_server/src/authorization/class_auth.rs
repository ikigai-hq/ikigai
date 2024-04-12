use oso::PolarClass;
use std::fmt::{Display, Formatter};

use crate::db::{Class, Member};

#[derive(Clone, Debug, PolarClass)]
pub struct ClassAuth {
    #[polar(attribute)]
    pub id: i32,
    #[polar(attribute)]
    pub has_this_member: bool,
    #[polar(attribute)]
    pub allow_student_self_enroll: bool,
    #[polar(attribute)]
    pub org_id: i32,
}

impl ClassAuth {
    pub fn new(class: &Class, member: &Option<Member>) -> Self {
        Self {
            id: class.id,
            org_id: class.org_id,
            has_this_member: member.is_some(),
            allow_student_self_enroll: false,
        }
    }
}

#[derive(Enum, Debug, Copy, Clone, Eq, PartialEq)]
pub enum ClassActionPermission {
    ViewClassContent,
    SelfEnroll,
    ManageClassContent,
    ManageClassMember,
    ManageClassSetting,
}

impl Display for ClassActionPermission {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let permission = match self {
            Self::ViewClassContent => "view_class_content",
            Self::SelfEnroll => "self_enroll",
            Self::ManageClassContent => "manage_class_content",
            Self::ManageClassMember => "manage_class_member",
            Self::ManageClassSetting => "manage_class_setting",
        };
        write!(f, "{permission}")
    }
}
