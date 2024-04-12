import { gql } from "@apollo/client";

export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($documentId: UUID!, $data: UpdateDocumentData!) {
    documentUpdate(documentId: $documentId, data: $data)
  }
`;

export const DUPLICATE_CLASS_DOCUMENT = gql`
  mutation DuplicateClassDocument($classId: Int!, $documentId: UUID!) {
    classDuplicateDocument(classId: $classId, documentId: $documentId) {
      classId
      documentId
      document {
        id
        title
        createdAt
        parentId
        index
        documentType
        hideRule
        deletedAt
      }
    }
  }
`;

export const ADD_CLASS_DOCUMENT = gql`
  mutation AddClassDocument($classId: Int!, $documentId: UUID!, $isAssignment: Boolean!) {
    classAddDocument(classId: $classId, documentId: $documentId, isAssignment: $isAssignment) {
      classId
      documentId
      document {
        id
        title
        createdAt
        parentId
        index
        documentType
        hideRule
        deletedAt
        assignment {
          id
        }
        submission {
          id
          submitAt
          isSubmitted
          allowForStudentViewAnswer
        }
      }
    }
  }
`;

export const CREATE_CLASS = gql`
  mutation CreateClass($data: NewClass!) {
    classCreate(data: $data) {
      id
      orgId
      starterDocument {
        documentId
      }
    }
  }
`;

export const DELETE_CLASS = gql`
  mutation DeleteClass($classId: Int!) {
    classDelete(classId: $classId)
  }
`;

export const SOFT_DELETE_CLASS = gql`
  mutation SoftDeleteClass($classId: Int!) {
    classSoftDelete(classId: $classId)
  }
`;

export const RESTORE_CLASS = gql`
  mutation RestoreClass($classId: Int!) {
    classRestore(classId: $classId) {
      id
    }
  }
`;

export const DUPLICATE_CLASS = gql`
  mutation DuplicateClass($classId: Int!) {
    classDuplicate(classId: $classId) {
      id
    }
  }
`;
