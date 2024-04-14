import { gql } from "@apollo/client";

export const CHECK_TOKEN = gql`
  query CheckToken {
    userMe {
      id
    }
  }
`;

export const CHECK_DOCUMENT = gql`
  query CheckDocument($documentId: UUID!) {
    userCheckDocument(documentId: $documentId)
  }
`;

export const MY_LAST_ACTIVITY = gql`
  query MyLastActivity {
    userLastActivity {
      lastDocumentId
    }
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
      members {
        userId
        orgId
        orgRole
        organization {
          id
          orgName
          ownerId
        }
      }
      activeUserAuth {
        orgId
        orgRole
      }
    }
  }
`;
