use async_graphql::*;

use crate::graphql::assignment_action::AssignmentMutation;
use crate::graphql::document_action::DocumentMutation;
use crate::graphql::file_action::FileMutation;
use crate::graphql::space_action::SpaceMutation;
use crate::graphql::user_action::UserMutation;

#[derive(MergedObject, Default)]
pub struct IkigaiMutation(
    AssignmentMutation,
    UserMutation,
    FileMutation,
    SpaceMutation,
    DocumentMutation,
);
