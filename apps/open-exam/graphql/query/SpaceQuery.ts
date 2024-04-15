import { gql } from "@apollo/client";

export const GET_SPACE_INFORMATION = gql`
  query GetDocuments($spaceId: Int!) {
    spaceGet(spaceId: $spaceId) {
      id
      name
      documents {
        id
        title
        createdAt
        parentId
        index
        documentType
        deletedAt
        assignment {
          id
        }
        submission {
          id
        }
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
        user {
          id
          firstName
          lastName
          email
          randomColor
          orgMember {
            orgRole
          }
          orgPersonalInformation {
            fullName
            avatar {
              publicUrl
            }
          }
          avatar {
            publicUrl
          }
        }
      }
    }
  }
`;

export const GET_BASIC_SPACE_DETAIL = gql`
  query GetBasicSpaceDetail($spaceId: Int!) {
    spaceGet(spaceId: $spaceId) {
      id
      name
      banner {
        publicUrl
      }
    }
  }
`;

export const GET_DELETED_SPACES = gql`
  query GetDeletedSpaces {
    spaceGetDeletedSpaces {
      id
      name
      deletedAt
      banner {
        publicUrl
      }
    }
  }
`;

export const GET_ORG_SPACES = gql`
  query GetOrgSpaces {
    spaceGetAllOrgSpaces {
      id
      name
    }
  }
`;
