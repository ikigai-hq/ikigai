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
        pageContents {
          id
          pageId
          index
          body
        }
      }
    }
  }
`;
