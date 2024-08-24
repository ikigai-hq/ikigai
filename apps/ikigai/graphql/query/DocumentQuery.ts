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
      visibility
      tags {
        tag
      }
      assignment {
        id
        maxNumberOfAttempt
        preDescription
        testDuration
        bandScoreId
        gradeMethod
        gradeByRubricId
        totalQuiz
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
        isSharedSubmission
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

export const GET_DOCUMENT_EMBED_SESSION = gql`
  query GetDocumentEmbedSession($documentId: UUID!) {
    documentGetEmbeddedSession(documentId: $documentId) {
      sessionId
      documentId
      isActive
    }
  }
`;

export const GET_SHARED_DOCUMENT = gql`
  query GetSharedDocument($documentId: UUID!, $sessionId: UUID!) {
    documentGetSharedInfoBySession(
      documentId: $documentId
      sessionId: $sessionId
    ) {
      document {
        id
        title
      }
      assignment {
        totalQuiz
        testDuration
        maxNumberOfAttempt
      }
    }
  }
`;

export const GET_EMBEDDED_RESPONSES = gql`
  query GetEmbeddedResponses($documentId: UUID!) {
    documentGetEmbeddedSession(documentId: $documentId) {
      sessionId
      documentId
      responses {
        submissionId
        responseUserId
        responseData {
          email
          phoneNumber
          firstName
          lastName
        }
        createdAt
      }
    }
  }
`;
