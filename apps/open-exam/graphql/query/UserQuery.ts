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
          orgUrl
        }
      }
      activeOrganization {
        id
        orgName
        ownerId
        orgUrl
      }
      activeUserAuth {
        orgId
        orgRole
      }
      activeOrgPersonalInformation {
        firstName
        lastName
        fullName
        avatar {
          uuid
          publicUrl
        }
      }
    }
  }
`;
