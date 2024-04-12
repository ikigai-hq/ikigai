use aj::async_trait::async_trait;
use aj::{Executable, Job, JobBuilder, AJ};
use uuid::Uuid;

use crate::connection_pool::get_conn_from_actor;
use crate::db::{Document, DocumentVersion};
use crate::error::OpenExamError;
use crate::helper::create_a_document_version;
use crate::util::{get_date_from_ts, get_now_as_secs};

pub const LAST_EDIT_PERIOD_SECS: i64 = 120;
pub const ACTIVELY_EDIT_PERIOD_SECS: i64 = 600;

pub fn insert_auto_version_history_jobs(document_id: Uuid, edited_by: i32) {
    let (last_edit_job, actively_edit_job) = new_last_edit_version_job(document_id, edited_by);
    // Force update and running
    AJ::add_job_and_force_run(last_edit_job);
    // It will skip the if the job is running and re run if the job is completed
    AJ::add_job(actively_edit_job);
}

pub fn format_last_edit_job_id(document_id: Uuid) -> String {
    format!("last_edit_version_{document_id}")
}

pub fn format_actively_editing_job_id(document_id: Uuid) -> String {
    format!("actively_editing_version_{document_id}")
}

pub fn new_last_edit_version_job(
    document_id: Uuid,
    edited_by: i32,
) -> (
    Job<CreateDocumentHistoryVersion>,
    Job<CreateDocumentHistoryVersion>,
) {
    let now = get_now_as_secs();
    let last_edit_msg = CreateDocumentHistoryVersion {
        document_id,
        edited_by,
        create_type: CreateVersionHistoryType::LastEdit,
    };
    let last_edit_job = JobBuilder::new(last_edit_msg)
        .set_id(format_last_edit_job_id(document_id))
        .set_schedule_at(get_date_from_ts(now + LAST_EDIT_PERIOD_SECS))
        .build();

    let actively_edit_msg = CreateDocumentHistoryVersion {
        document_id,
        edited_by,
        create_type: CreateVersionHistoryType::ActivelyEdit,
    };
    let actively_edit_job = JobBuilder::new(actively_edit_msg)
        .set_id(format_actively_editing_job_id(document_id))
        .set_schedule_at(get_date_from_ts(now + ACTIVELY_EDIT_PERIOD_SECS))
        .build();

    (last_edit_job, actively_edit_job)
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum CreateVersionHistoryType {
    ActivelyEdit,
    LastEdit,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateDocumentHistoryVersion {
    pub document_id: Uuid,
    pub create_type: CreateVersionHistoryType,
    pub edited_by: i32,
}

#[async_trait]
impl Executable for CreateDocumentHistoryVersion {
    type Output = ();
    async fn execute(&self) {
        if let Err(err) = handle_auto_create_document_history_version(
            self.document_id,
            self.edited_by,
            self.create_type,
        )
        .await
        {
            error!("Error check transcoding file {:?} {:?}", self, err);
        }
    }
}

async fn handle_auto_create_document_history_version(
    document_id: Uuid,
    edited_by: i32,
    create_type: CreateVersionHistoryType,
) -> Result<(), OpenExamError> {
    match create_type {
        CreateVersionHistoryType::LastEdit => handle_last_edit(document_id, edited_by).await?,
        CreateVersionHistoryType::ActivelyEdit => {
            handle_actively_edit(document_id, edited_by).await?
        }
    };
    Ok(())
}

async fn handle_actively_edit(document_id: Uuid, edited_by: i32) -> Result<(), OpenExamError> {
    info!("Handle Actively Edit Auto History Version of document_id {document_id}");
    let conn = get_conn_from_actor().await?;
    let now = get_now_as_secs();
    let document = Document::find_by_id(&conn, document_id)?;

    let version_overlapped = DocumentVersion::find_last_version_of_document(&conn, document_id)
        .map_or(true, |version| {
            now - version.created_at <= ACTIVELY_EDIT_PERIOD_SECS
        });
    if !version_overlapped {
        let name = format!("(Auto) {}", document.title);
        create_a_document_version(&conn, edited_by, &document, &name, document.updated_by)?;
    }

    Ok(())
}

async fn handle_last_edit(document_id: Uuid, edited_by: i32) -> Result<(), OpenExamError> {
    info!("Handle Last Edit Auto History Version of document_id {document_id}");
    let conn = get_conn_from_actor().await?;
    let now = get_now_as_secs();
    let document = Document::find_by_id(&conn, document_id)?;

    let version_overlapped = DocumentVersion::find_last_version_of_document(&conn, document_id)
        .map_or(true, |version| {
            now - version.created_at <= LAST_EDIT_PERIOD_SECS
        });
    if !version_overlapped {
        let name = format!("(Auto) {}", document.title);
        create_a_document_version(&conn, edited_by, &document, &name, document.updated_by)?;
        info!("Create a document version successfully! Last Edit - {document_id}")
    }

    Ok(())
}
