import { gql } from "@apollo/client";

export const GET_DOCUMENT_V2 = gql`
  query GetDocumentV2($documentId: UUID!) {
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
      assignment {
        id
        maxNumberOfAttempt
        preDescription
        testDuration
        bandScoreId
        gradeMethod
        forceAutoSubmit
        gradeByRubricId
      }
      submission {
        id
        documentId
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
