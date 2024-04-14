use crate::graphql::assignment_action::AssignmentQuery;
use async_graphql::*;

use crate::graphql::document_action::DocumentQuery;
use crate::graphql::file_action::FileQuery;
use crate::graphql::organization_action::OrganizationQuery;
use crate::graphql::quiz_action::QuizQuery;
use crate::graphql::space_action::SpaceQuery;
use crate::graphql::thread_action::ThreadQuery;
use crate::graphql::user_action::UserQuery;

#[derive(MergedObject, Default)]
pub struct OpenExamQuery(
    AssignmentQuery,
    UserQuery,
    FileQuery,
    SpaceQuery,
    ThreadQuery,
    DocumentQuery,
    QuizQuery,
    OrganizationQuery,
);
