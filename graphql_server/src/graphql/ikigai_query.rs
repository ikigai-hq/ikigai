use async_graphql::*;

use crate::graphql::assignment_action::AssignmentQuery;
use crate::graphql::document_action::DocumentQuery;
use crate::graphql::file_action::FileQuery;
use crate::graphql::quiz_action::QuizQuery;
use crate::graphql::space_action::SpaceQuery;
use crate::graphql::user_action::UserQuery;

#[derive(MergedObject, Default)]
pub struct IkigaiQuery(
    AssignmentQuery,
    UserQuery,
    FileQuery,
    SpaceQuery,
    DocumentQuery,
    QuizQuery,
);
