import { gql } from "@apollo/client";

export const GET_DOCUMENT = gql`
  query GetDocument($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      title
      coverPhotoId
      coverPhotoUrl
      updatedAt
      deletedAt
      spaceId
      iconType
      iconValue
      documentType
      parentId
      isPrivate
      isDefaultFolderPrivate
      assignment {
        id
        maxNumberOfAttempt
        preDescription
        testDuration
        bandScoreId
        gradeMethod
        gradeByRubricId
      }
      submission {
        id
        documentId
        startAt
        submitAt
        feedbackAt
        feedback
        finalGrade
        testDuration
        attemptNumber
        user {
          id
          name
          avatar {
            publicUrl
          }
          randomColor
        }
        assignment {
          id
          documentId
        }
      }
    }
  }
`;

export const GET_PAGES = gql`
  query GetPages($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      pages {
        id
        documentId
        index
        title
        layout
      }
    }
  }
`;

export const GET_DOCUMENT_PAGE_CONTENT = gql`
  query GetDocumentPageContents($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      pages {
        id
        pageContents {
          id
          pageId
          index
          body
          updatedAt
          createdAt
        }
      }
    }
  }
`;

export const GET_DOCUMENT_ASSIGNEE = gql`
  query GetDocumentAssignees($documentId: UUID!) {
    documentGetAssignees(documentId: $documentId) {
      createdAt
      user {
        id
        name
        avatar {
          publicUrl
        }
      }
    }
  }
`;

export const GET_WRITING_BLOCK = gql`
  query GetWritingBlock($writingBlockId: UUID!) {
    documentGetWritingBlock(writingBlockId: $writingBlockId) {
      id
      pageContentId
      creatorId
      content
      updatedAt
      createdAt
    }
  }
`;
