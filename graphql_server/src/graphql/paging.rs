use async_graphql::*;

use crate::db::*;

#[derive(Debug, Clone, InputObject)]
pub struct PagingInput {
    #[graphql(validator(minimum = 0))]
    #[graphql(default = 0)]
    pub offset: i64,
    #[graphql(validator(minimum = 0, maximum = 100))]
    #[graphql(default = 10)]
    pub limit: i64,
}

impl PagingInput {
    pub fn get(&self) -> (i64, i64) {
        (self.offset, self.limit)
    }
}

#[derive(SimpleObject)]
#[graphql(concrete(name = "FileList", params(File)))]
#[graphql(concrete(name = "SpaceList", params(Space)))]
#[graphql(concrete(name = "SpaceMemberList", params(SpaceMember)))]
#[graphql(concrete(name = "AssignmentList", params(Assignment)))]
#[graphql(concrete(name = "OrganizationMemberList", params(OrganizationMember)))]
pub struct PagingResult<T: OutputType> {
    items: Vec<T>,
    total: i64,
}

impl<T: OutputType> PagingResult<T> {
    pub fn new(items: Vec<T>, total: i64) -> Self {
        Self { items, total }
    }
}
