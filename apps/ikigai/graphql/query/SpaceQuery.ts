import { gql } from "@apollo/client";

export const GET_SPACE_INFORMATION = gql`
  query GetDocuments($spaceId: Int!) {
    spaceGet(spaceId: $spaceId) {
      id
      name
      creatorId
      documents {
        id
        title
        createdAt
        parentId
        index
        documentType
        deletedAt
        iconType
        iconValue
        tags {
          tag
        }
        assignment {
          id
          submissions {
            id
            userId
            finalGrade
            grade
            attemptNumber
            documentId
          }
        }
        submission {
          id
        }
        visibility
      }
    }
  }
`;

export const GET_SPACE_MEMBERS = gql`
  query GetSpaceMembers($spaceId: Int!) {
    spaceGet(spaceId: $spaceId) {
      id
      members {
        userId
        spaceId
        createdAt
        role
        user {
          id
          firstName
          lastName
          email
          randomColor
          name
          avatar {
            publicUrl
          }
        }
      }
    }
  }
`;

export const GET_SPACE_INVITE_TOKENS = gql`
  query GetSpaceInviteTokens($spaceId: Int!) {
    spaceGetInviteTokens(spaceId: $spaceId) {
      spaceId
      creator {
        id
        firstName
        lastName
        email
        avatar {
          publicUrl
        }
        randomColor
      }
      token
      invitingRole
      uses
      expireAt
      createdAt
    }
  }
`;

export const GET_MY_SPACES = gql`
  query GetMySpaces {
    spaceMine {
      id
      name
    }
  }
`;

export const GET_MY_OWN_SPACES = gql`
  query GetMyOwnSpaces {
    spaceOwn {
      id
      name
    }
  }
`;

export const GET_SPACE_AVAILABLE_DOCUMENTS = gql`
  query GetSpaceAvailableDocuments($spaceId: Int!) {
    spaceGet(spaceId: $spaceId) {
      id
      nonSubmissionDocuments {
        id
      }
    }
  }
`;
