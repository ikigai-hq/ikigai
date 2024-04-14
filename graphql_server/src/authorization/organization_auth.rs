use crate::db::Organization;
use oso::PolarClass;
use std::fmt::{Display, Formatter};

#[derive(Clone, Debug, PolarClass)]
pub struct OrganizationAuth {
    #[polar(attribute)]
    pub id: i32,
    #[polar(attribute)]
    pub owner_id: Option<i32>,
}

impl From<Organization> for OrganizationAuth {
    fn from(value: Organization) -> Self {
        Self {
            id: value.id,
            owner_id: value.owner_id,
        }
    }
}

#[derive(Enum, Debug, Copy, Clone, Eq, PartialEq)]
pub enum OrganizationActionPermission {
    ViewMemberPublicInformation,
    EditOrgMemberInformation,
    AddOrgMember,
    RemoveOrgMember,
    AddSpace,
    ManageTemplate,
    ManageTrash,
    ManageOrgInformation,
}

impl Display for OrganizationActionPermission {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let permission = match self {
            Self::ViewMemberPublicInformation => "view_member_public_information",
            Self::EditOrgMemberInformation => "edit_org_member_information",
            Self::AddOrgMember => "add_org_member",
            Self::RemoveOrgMember => "remove_org_member",
            Self::AddSpace => "add_space",
            Self::ManageTemplate => "manage_template",
            Self::ManageTrash => "manage_trash",
            Self::ManageOrgInformation => "manage_org_information",
        };
        write!(f, "{permission}")
    }
}
