import { gql } from "@apollo/client";

export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($documentId: UUID!, $data: UpdateDocumentData!) {
    documentUpdate(documentId: $documentId, data: $data)
  }
`;

export const DUPLICATE_SPACE_DOCUMENT = gql`
  mutation DuplicateSpaceDocument($spaceId: Int!, $documentId: UUID!) {
    spaceDuplicateDocument(spaceId: $spaceId, documentId: $documentId) {
      id
      title
      createdAt
      parentId
      index
      documentType
      hideRule
      deletedAt
      spaceId
    }
  }
`;

export const ADD_SPACE_DOCUMENT = gql`
  mutation AddSpaceDocument($spaceId: Int!, $documentId: UUID!, $isAssignment: Boolean!) {
    spaceAddDocument(spaceId: $spaceId, documentId: $documentId, isAssignment: $isAssignment) {
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
`;

export const CREATE_SPACE = gql`
  mutation CreateSpace($data: NewSpace!) {
    spaceCreate(data: $data) {
      id
      orgId
      starterDocument {
        id
      }
    }
  }
`;

export const DUPLICATE_SPACE = gql`
  mutation DuplicateSpace($spaceId: Int!) {
    spaceDuplicate(spaceId: $spaceId) {
      id
    }
  }
`;

export const SOFT_DELETE_SPACE = gql`
  mutation SoftDeleteSpace($spaceId: Int!) {
    spaceSoftDelete(spaceId: $spaceId)
  }
`;

export const RESTORE_SPACE = gql`
  mutation RestoreSpace($spaceId: Int!) {
    spaceRestore(spaceId: $spaceId) {
      id
    }
  }
`;

export const DELETE_SPACE = gql`
  mutation DeleteSpace($spaceId: Int!) {
    spaceDelete(spaceId: $spaceId)
  }
`;
