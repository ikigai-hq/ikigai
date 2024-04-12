import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($identity: OpenExamIdentity!, $password: String!) {
    userLogin(identity: $identity, password: $password)
  }
`;
