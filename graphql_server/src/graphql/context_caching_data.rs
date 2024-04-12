use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

use crate::authorization::{ClassAuth, DocumentAuth};
use crate::db::{Organization, OrganizationMember, User};

// Shared User info to avoid query it again
#[derive(Default)]
pub struct RequestContextCachingData {
    user: Arc<RwLock<Option<User>>>,
    document_auth: Arc<RwLock<HashMap<Uuid, DocumentAuth>>>,
    // (class_id, user_id) - ClassAuth
    class_auth: Arc<RwLock<HashMap<(i32, i32), ClassAuth>>>,
    // Active org members
    org_members: Arc<RwLock<HashMap<i32, OrganizationMember>>>,
    org_auth: Arc<RwLock<HashMap<i32, Organization>>>,
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

    pub fn add_org_member(&self, member: OrganizationMember) -> OrganizationMember {
        if let Ok(mut guard_org_members) = self.org_members.try_write() {
            guard_org_members.insert(member.user_id, member.clone());
        }
        member
    }

    pub fn get_org_member(&self, user_id: i32) -> Option<OrganizationMember> {
        if let Ok(guard_org_members) = self.org_members.try_read() {
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

    pub fn add_class_auth(&self, class_id: i32, user_id: i32, class_auth: ClassAuth) -> ClassAuth {
        if let Ok(mut guard_classes) = self.class_auth.try_write() {
            guard_classes.insert((class_id, user_id), class_auth.clone());
        }

        class_auth
    }

    pub fn get_class_auth(&self, class_id: i32, user_id: i32) -> Option<ClassAuth> {
        if let Ok(guard_classes) = self.class_auth.try_read() {
            guard_classes.get(&(class_id, user_id)).cloned()
        } else {
            None
        }
    }

    pub fn add_org_auth(&self, org: Organization) -> Organization {
        if let Ok(mut org_auth) = self.org_auth.try_write() {
            org_auth.insert(org.id, org.clone());
        }

        org
    }

    pub fn get_org_auth(&self, org_id: i32) -> Option<Organization> {
        if let Ok(org_auth) = self.org_auth.try_read() {
            org_auth.get(&org_id).cloned()
        } else {
            None
        }
    }
}
