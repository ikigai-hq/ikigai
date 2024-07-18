use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

use crate::authorization::{DocumentAuth, SpaceAuth, UserAuth};
use crate::db::{Page, User};

// Shared Request Context to reuse later in other place in same request
#[derive(Default)]
pub struct RequestContextCachingData {
    user: Arc<RwLock<Option<User>>>,
    document_auth: Arc<RwLock<HashMap<Uuid, DocumentAuth>>>,
    // (space_id, user_id) - ClassAuth
    space_auth: Arc<RwLock<HashMap<(i32, i32), SpaceAuth>>>,
    user_auth: Arc<RwLock<HashMap<i32, UserAuth>>>,
    // Page caching
    page_by_page_content: Arc<RwLock<HashMap<Uuid, Page>>>,
}

impl RequestContextCachingData {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_user(&self, user: User) -> Option<User> {
        if let Ok(mut guard_user) = self.user.try_write() {
            *guard_user = Some(user.clone());
            Some(user)
        } else {
            None
        }
    }

    pub fn get_user(&self) -> Option<User> {
        if let Ok(user) = self.user.try_read() {
            user.clone()
        } else {
            None
        }
    }

    pub fn add_user_auth(&self, user: UserAuth) -> UserAuth {
        if let Ok(mut guard_org_members) = self.user_auth.try_write() {
            guard_org_members.insert(user.id, user.clone());
        }
        user
    }

    pub fn get_user_auth(&self, user_id: i32) -> Option<UserAuth> {
        if let Ok(guard_org_members) = self.user_auth.try_read() {
            guard_org_members.get(&user_id).cloned()
        } else {
            None
        }
    }

    pub fn add_document_auth(
        &self,
        document_id: Uuid,
        document_auth: DocumentAuth,
    ) -> Option<DocumentAuth> {
        if let Ok(mut guard_documents) = self.document_auth.try_write() {
            guard_documents.insert(document_id, document_auth.clone());
            Some(document_auth)
        } else {
            None
        }
    }

    pub fn get_document_auth(&self, document_id: Uuid) -> Option<DocumentAuth> {
        if let Ok(guard_documents) = self.document_auth.try_read() {
            guard_documents.get(&document_id).cloned()
        } else {
            None
        }
    }

    pub fn add_space_auth(&self, space_id: i32, user_id: i32, class_auth: SpaceAuth) -> SpaceAuth {
        if let Ok(mut guard_classes) = self.space_auth.try_write() {
            guard_classes.insert((space_id, user_id), class_auth.clone());
        }

        class_auth
    }

    pub fn get_space_auth(&self, space_id: i32, user_id: i32) -> Option<SpaceAuth> {
        if let Ok(guard_classes) = self.space_auth.try_read() {
            guard_classes.get(&(space_id, user_id)).cloned()
        } else {
            None
        }
    }

    pub fn add_page_with_page_content(&self, page_content_id: Uuid, page: Page) -> Page {
        if let Ok(mut guard_pages) = self.page_by_page_content.try_write() {
            guard_pages.insert(page_content_id, page.clone());
        }

        page
    }

    pub fn get_page_by_page_content(&self, page_content_id: Uuid) -> Option<Page> {
        if let Ok(guard_pages) = self.page_by_page_content.try_read() {
            guard_pages.get(&page_content_id).cloned()
        } else {
            None
        }
    }
}
