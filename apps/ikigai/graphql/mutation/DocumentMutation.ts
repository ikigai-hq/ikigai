import { gql } from "@apollo/client";

export const SOFT_DELETE_DOCUMENTS = gql`
  mutation SoftDeleteDocuments($documentIds: [UUID!]!, $spaceId: Int!) {
    spaceSoftDeleteMultiple(spaceId: $spaceId, documentIds: $documentIds)
  }
`;

export const ADD_DOCUMENT_STANDALONE_V2 = gql`
  mutation AddDocumentStandaloneV2(
    $data: NewDocument!
    $spaceId: Int
    $isAssignment: Boolean!
  ) {
    documentCreate(
      data: $data
      spaceId: $spaceId
      isAssignment: $isAssignment
    ) {
      id
      title
      createdAt
      parentId
      index
      documentType
      deletedAt
      iconType
      iconValue
      assignment {
        id
      }
      submission {
        id
      }
    }
  }
`;

export const UPDATE_DOCUMENT_POSITIONS = gql`
  mutation UpdateDocumentPositions($items: [UpdatePositionData!]!) {
    documentUpdatePositions(items: $items)
  }
`;

export const ADD_OR_UPDATE_PAGE = gql`
  mutation AddOrUpdatePage($page: PageInput!) {
    documentAddOrUpdatePage(page: $page) {
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
`;

export const REMOVE_PAGE = gql`
  mutation RemovePage($pageId: UUID!) {
    documentRemovePage(pageId: $pageId)
  }
`;

export const ADD_ORG_UPDATE_PAGE_CONTENT = gql`
  mutation AddOrUpdatePageContent($pageContent: PageContentInput!) {
    documentAddOrUpdatePageContent(pageContent: $pageContent) {
      id
      pageId
      index
      body
      updatedAt
      createdAt
    }
  }
`;
