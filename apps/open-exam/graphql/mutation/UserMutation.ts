import { gql } from "@apollo/client";

export const ADD_ORG_MEMBER = gql`
  mutation AddOrgMember($data: AddUserData!) {
    orgAddOrgMember(data: $data) {
      id
    }
  }
`;
