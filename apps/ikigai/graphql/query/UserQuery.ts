import { gql } from "@apollo/client";

export const CHECK_TOKEN = gql`
  query CheckToken {
    userMe {
      id
    }
  }
`;

export const CHECK_DOCUMENT_SPACE = gql`
  query CheckDocument($documentId: UUID!) {
    spaceGetSpaceByDocument(currentDocumentId: $documentId)
  }
`;

export const USER_ME = gql`
  query UserMe {
    userMe {
      id
      email
      firstName
      lastName
      createdAt
      randomColor
      avatarFileId
      avatar {
        publicUrl
      }
      activeUserAuth {
        role
      }
    }
  }
`;

export const GET_DOCUMENT_PERMISSIONS = gql`
  query GetDocumentPermissions($documentId: UUID!) {
    documentMyPermissions(documentId: $documentId)
  }
`;

export const GET_SPACE_PERMISSIONS = gql`
  query GetSpacePermissions($spaceId: Int!) {
    spaceMyPermissions(spaceId: $spaceId)
  }
`;
