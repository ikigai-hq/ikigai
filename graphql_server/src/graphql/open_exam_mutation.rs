use async_graphql::*;

use crate::graphql::assignment_action::AssignmentMutation;
use crate::graphql::class_action::ClassMutation;
use crate::graphql::document_action::DocumentMutation;
use crate::graphql::file_action::FileMutation;
use crate::graphql::organization_action::OrganizationMutation;
use crate::graphql::quiz_action::QuizMutation;
use crate::graphql::thread_action::ThreadMutation;
use crate::graphql::user_action::UserMutation;

#[derive(MergedObject, Default)]
pub struct OpenExamMutation(
    AssignmentMutation,
    UserMutation,
    FileMutation,
    ClassMutation,
    ThreadMutation,
    DocumentMutation,
    QuizMutation,
    OrganizationMutation,
);
