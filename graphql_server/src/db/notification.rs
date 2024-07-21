use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use serde_json::Value;
use uuid::Uuid;

use super::schema::{notification_receivers, notifications};
use crate::db::User;
use crate::helper::generate_document_magic_link;
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;
use crate::util::url_util::{format_document_url, format_space_url};

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[diesel(sql_type = Integer)]
pub enum NotificationType {
    NewSpaceMember,
    SubmitSubmission,
    FeedbackSubmission,
    AssignToAssignment,
}

impl_enum_for_db!(NotificationType);

impl Default for NotificationType {
    fn default() -> Self {
        Self::NewSpaceMember
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject)]
#[diesel(table_name = notifications)]
pub struct Notification {
    pub id: Uuid,
    pub notification_type: NotificationType,
    pub context: Value,
    pub created_at: i64,
}

impl Notification {
    pub fn new<T: serde::Serialize>(notification_type: NotificationType, context: T) -> Self {
        Self {
            id: Uuid::new_v4(),
            notification_type,
            context: serde_json::to_value(context).unwrap_or(Value::Null),
            created_at: get_now_as_secs(),
        }
    }

    pub fn new_space_member_notification(context: NewSpaceMemberContext) -> Self {
        Self::new(NotificationType::NewSpaceMember, context)
    }

    pub fn new_submit_submission_notification(context: SubmitSubmissionContext) -> Self {
        Self::new(NotificationType::SubmitSubmission, context)
    }

    pub fn new_feedback_submission_notification(context: FeedbackSubmissionContext) -> Self {
        Self::new(NotificationType::FeedbackSubmission, context)
    }

    pub fn new_assign_to_assignment_notification(context: AssignToAssignmentContext) -> Self {
        Self::new(NotificationType::AssignToAssignment, context)
    }

    pub fn insert(conn: &mut PgConnection, notification: Self) -> Result<Self, Error> {
        diesel::insert_into(notifications::table)
            .values(&notification)
            .on_conflict_do_nothing()
            .execute(conn)?;
        Ok(notification)
    }
}

pub trait ContextMessage {
    fn get_title(&self) -> String;
    fn get_message(&self) -> String;
    fn get_url_path(&self, receiver: &User) -> String;
    fn get_action_name(&self) -> String {
        "View".to_string()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewSpaceMemberContext {
    pub space_id: i32,
    pub space_name: String,
    pub email: String,
}

impl ContextMessage for NewSpaceMemberContext {
    fn get_title(&self) -> String {
        "🎉 New Member Alert! 🎉".to_string()
    }

    fn get_message(&self) -> String {
        format!(
            r#""{user}" just joined {space_name}! Let's give them a warm welcome and help them settle in. 🚀"#,
            user = self.email,
            space_name = self.space_name
        )
    }

    fn get_url_path(&self, _: &User) -> String {
        format_space_url(self.space_id)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubmitSubmissionContext {
    pub document_submission_id: Uuid,
    pub submission_name: String,
    pub student_name: String,
}

impl ContextMessage for SubmitSubmissionContext {
    fn get_title(&self) -> String {
        "📣 Submission Alert! 📣".to_string()
    }
    fn get_message(&self) -> String {
        format!(
            r#"
"{student_name}" has just submitted their work in {submission_name}. Time to check it out and provide feedback! 📝💬
        "#,
            student_name = self.student_name,
            submission_name = self.submission_name,
        )
    }

    fn get_url_path(&self, _: &User) -> String {
        format_document_url(self.document_submission_id)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackSubmissionContext {
    pub document_submission_id: Uuid,
    pub submission_name: String,
}

impl ContextMessage for FeedbackSubmissionContext {
    fn get_title(&self) -> String {
        "📝 Feedback Alert! 📝".to_string()
    }

    fn get_message(&self) -> String {
        format!(
            r#"
Great news! Your teacher has provided feedback on your submission in {submission_name}. Make sure to review it and let us know if you have any questions. Keep up the excellent work! 👍
        "#,
            submission_name = self.submission_name
        )
    }

    fn get_url_path(&self, _: &User) -> String {
        format_document_url(self.document_submission_id)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssignToAssignmentContext {
    pub assignment_document_id: Uuid,
    pub assignment_name: String,
}

impl ContextMessage for AssignToAssignmentContext {
    fn get_title(&self) -> String {
        "📝 Assigned to New Assignment! 📝".to_string()
    }

    fn get_message(&self) -> String {
        format!(
            r#"
Hello there! You've been assigned to a assignment: {assignment_name}. If you have any questions or need assistance, don't hesitate to reach out. Best of luck! 🚀 "#,
            assignment_name = self.assignment_name,
        )
    }

    fn get_url_path(&self, receiver: &User) -> String {
        generate_document_magic_link(receiver.id, self.assignment_document_id)
            .unwrap_or(format_document_url(self.assignment_document_id))
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject)]
#[diesel(table_name = notification_receivers)]
pub struct NotificationReceiver {
    pub notification_id: Uuid,
    pub user_id: i32,
    pub created_at: i64,
}

impl NotificationReceiver {
    pub fn new(notification_id: Uuid, user_id: i32) -> Self {
        Self {
            notification_id,
            user_id,
            created_at: get_now_as_secs(),
        }
    }

    pub fn upsert(
        conn: &mut PgConnection,
        items: Vec<NotificationReceiver>,
    ) -> Result<Vec<Self>, Error> {
        diesel::insert_into(notification_receivers::table)
            .values(items)
            .on_conflict_do_nothing()
            .get_results(conn)
    }

    pub fn find_all_by_notification(
        conn: &mut PgConnection,
        notification_id: Uuid,
    ) -> Result<Vec<Self>, Error> {
        notification_receivers::table
            .filter(notification_receivers::notification_id.eq(notification_id))
            .get_results(conn)
    }
}
