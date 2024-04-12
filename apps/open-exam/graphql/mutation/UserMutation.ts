import { gql } from "@apollo/client";

export const UpdateUserInfo = gql`
  mutation UserUpdateInfo($input: UpdateUserData!) {
    userUpdateInfo(input: $input)
  }
`;

export const UPDATE_PASSWORD = gql`
  mutation UserUpdatePassword(
    $currentPassword: String!
    $newPassword: String!
  ) {
    userUpdatePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    )
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation UserForgotPassword($identity: OpenExamIdentity!) {
    userForgotPassword(identity: $identity)
  }
`;

export const RESET_PASSWORD = gql`
  mutation UserResetPassword(
    $identity: OpenExamIdentity!
    $otp: String!
    $newPassword: String!
  ) {
    userResetPassword(identity: $identity, otp: $otp, newPassword: $newPassword)
  }
`;

export const ADD_ORG_MEMBER = gql`
  mutation AddOrgMember($data: AddUserData!) {
    orgAddOrgMember(data: $data) {
      id
    }
  }
`;

export const REMOVE_ORG_MEMBER = gql`
  mutation RemoveOrgMember($userId: Int!) {
    orgRemoveOrgMember(userId: $userId)
  }
`;

export const UPDATE_ORG_MEMBER = gql`
  mutation UpdateMemberNote($orgMember: OrganizationMemberInput!) {
    orgUpdateOrgMember(orgMember: $orgMember) {
      id
    }
  }
`;

export const UPDATE_ORG_BRANDING = gql`
  mutation UpdateOrg(
    $orgId: Int!
    $data: UpdateOrganizationData!
  ) {
    orgUpdate(orgId: $orgId, data: $data) {
      id
      orgName
      ownerId
      orgUrl
    }
  }
`;
