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
      activeOrgMember {
        orgId
        userId
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

export const GET_ORGANIZATION_MEMBERS = gql`
  query GetOrganizationMembers($filterOptions: OrgMemberFilterOptions!) {
    orgFindMembers(filterOptions: $filterOptions) {
      items {
        userId
        orgId
        orgRole
        personalInformation {
          fullName
          avatar {
            publicUrl
          }
        }
        user {
          id
          firstName
          lastName
          createdAt
          randomColor
          email
          avatar {
            publicUrl
          }
          classMembers {
            classId
            userId
            class {
              id
              name
              starterDocument {
                documentId
              }
            }
          }
        }
      }
      total
    }
  }
`;

export const GET_INITIAL_ONBOARDING_USER_INFO = gql`
  query GetInitialOnboardingUserInfo {
    userMe {
      id
      firstName
      lastName
    }
  }
`;


export const GET_ORG_STATS = gql`
  query GetOrgStats {
    orgMemberStats{
      totalTeacher
      totalStudent
    }
  }
`;
