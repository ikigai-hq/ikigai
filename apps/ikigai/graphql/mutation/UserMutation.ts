import { gql } from "@apollo/client";

export const SEND_MAGIC_LINK = gql`
  mutation SendMagicLink($email: String!) {
    userGenerateMagicLink(email: $email)
  }
`;

export const VERIFY_MAGIC_LINK = gql`
  mutation VerifyMagicLink($userId: Int!, $otp: String!) {
    userCheckMagicLink(userId: $userId, otp: $otp) {
      user {
        id
      }
      accessToken
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateUserData!) {
    userUpdateInfo(input: $input)
  }
`;

export const SIGNIN_WITH_GOOGLE = gql`
  mutation SigninWithGoogle($idToken: String!) {
    userSigninWithGoogle(idToken: $idToken) {
      user {
        id
      }
      accessToken
    }
  }
`;
