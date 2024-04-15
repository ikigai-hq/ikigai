// FIXME: This is the temporary way to handle policy of the application.
// We should replace by permission return in backend side.

import {GetDocumentDetail_documentGet as IDocument, OrgRole, UserMe,} from "graphql/types";

export enum Permission {
  // Space Permission
  ViewSpaceContent,
  SelfEnroll,
  ManageSpaceContent,
  ManageSpaceMember,
  ManageSpaceSetting,
  
  // Org Permission
  ViewMemberPublicInformation,
  EditOrgMemberInformation,
  AddOrgMember,
  RemoveOrgMember,
  AddSpace,
  RemoveSpace,
  ManageTemplate,
  ManageTrash,
  ManageOrgInformation,
}

export const STUDENT_PERMISSIONS = [
  Permission.ViewSpaceContent,
  Permission.SelfEnroll,
  Permission.ViewMemberPublicInformation,
];

export const TEACHER_PERMISSIONS = [
  ...STUDENT_PERMISSIONS,
  Permission.ManageSpaceContent,
  Permission.ManageSpaceMember,
  Permission.ManageSpaceSetting,
  Permission.ViewMemberPublicInformation,
  Permission.EditOrgMemberInformation,
  Permission.AddOrgMember,
  Permission.RemoveOrgMember,
  Permission.AddSpace,
  Permission.RemoveSpace,
  Permission.ManageTemplate,
  Permission.ManageTrash,
  Permission.ManageOrgInformation,
];

export const getPermissions = (orgRole: OrgRole): Permission[] => {
  switch (orgRole) {
    case OrgRole.STUDENT:
      return STUDENT_PERMISSIONS;
    default:
      return TEACHER_PERMISSIONS;
  }
};

export const allow = (
  orgRole: OrgRole,
  permission: Permission,
): boolean => {
  return getPermissions(orgRole).includes(permission);
};

export enum DocumentType {
  Normal,
  Assignment,
  Submission,
}

export const getDocumentType = (doc?: IDocument | any): DocumentType => {
  if (doc?.assignment) return DocumentType.Assignment;
  if (doc?.submission) return DocumentType.Submission;

  return DocumentType.Normal;
};

export enum DocumentPermission {
  ViewDocument,
  InteractiveWithTool,
  ViewAnswer,
  EditDocument,
  ManageDocument,
}

export const VIEW_ONLY_PERMISSIONS = [
  DocumentPermission.ViewDocument,
];

export const INTERACTION_PERMISSIONS = [
  ...VIEW_ONLY_PERMISSIONS,
  DocumentPermission.InteractiveWithTool,
];

export const DOING_SUBMISSION_PERMISSIONS = [
  ...INTERACTION_PERMISSIONS,
  DocumentPermission.EditDocument,
];

export const FULL_DOCUMENT_PERMISSIONS = [
  ...DOING_SUBMISSION_PERMISSIONS,
  DocumentPermission.ViewAnswer,
  DocumentPermission.ManageDocument,
];

export const getDocumentPermissions = (
  doc: IDocument,
  user: UserMe,
  isPreviewMode?: boolean,
): DocumentPermission[] => {
  if (isPreviewMode) return VIEW_ONLY_PERMISSIONS;
  
  const role = user?.userMe?.activeUserAuth?.orgRole;
  const documentType = getDocumentType(doc);

  if (role === OrgRole.TEACHER) return FULL_DOCUMENT_PERMISSIONS;

  // Student
  switch (documentType) {
    case DocumentType.Normal:
      return VIEW_ONLY_PERMISSIONS;

    case DocumentType.Assignment:
      return VIEW_ONLY_PERMISSIONS;

    case DocumentType.Submission:
      if (doc.submission.isSubmitted) {
        return VIEW_ONLY_PERMISSIONS;
      }

      if (doc.submission.canChangeStructure) {
        return DOING_SUBMISSION_PERMISSIONS;
      }

      return INTERACTION_PERMISSIONS;
    default:
      return VIEW_ONLY_PERMISSIONS;
  }
};

export const documentAllow = (
  doc: IDocument,
  user: UserMe,
  permission: DocumentPermission,
  isPreviewMode?: boolean,
): boolean => {
  return getDocumentPermissions(doc, user, isPreviewMode).includes(permission);
};
