import { gql } from "@apollo/client";

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
