import { gql } from "@apollo/client";

export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($documentId: UUID!, $data: UpdateDocumentData!) {
    documentUpdate(documentId: $documentId, data: $data)
  }
`;

export const DUPLICATE_SPACE_DOCUMENT = gql`
  mutation DuplicateSpaceDocument($spaceId: Int!, $documentId: UUID!) {
    spaceDuplicateDocument(spaceId: $spaceId, documentId: $documentId) {
      id
      title
      createdAt
      parentId
      index
      documentType
      deletedAt
      iconType
      iconValue
      assignment {
        id
      }
      submission {
        id
      }
    }
  }
`;

export const UPDATE_SPACE = gql`
  mutation UpdateSpace($spaceId: Int!, $data: UpdateSpaceData!) {
    spaceUpdate(spaceId: $spaceId, data: $data)
  }
`;

export const GENERATE_SPACE_INVITE_TOKEN = gql`
  mutation GenerateSpaceInviteToken($data: SpaceInviteTokenInput!) {
    spaceGenerateInviteToken(data: $data) {
      spaceId
      token
    }
  }
`;

export const DELETE_SPACE_INVITE_TOKEN = gql`
  mutation DeleteSpaceInviteToken($spaceId: Int!, $inviteToken: String!) {
    spaceRemoveInviteToken(spaceId: $spaceId, inviteToken: $inviteToken)
  }
`;

export const JOIN_SPACE_BY_INVITE_TOKEN = gql`
  mutation JoinSpaceByInviteToken(
    $email: String!
    $spaceId: Int!
    $token: String!
  ) {
    spaceJoinByInviteToken(email: $email, spaceId: $spaceId, token: $token) {
      documentId
      shouldGoToSpace
    }
  }
`;

export const REMOVE_SPACE_MEMBER = gql`
  mutation RemoveSpaceMember($spaceId: Int!, $userId: Int!) {
    spaceRemoveMember(spaceId: $spaceId, userId: $userId)
  }
`;

export const CREATE_SPACE = gql`
  mutation CreateSpace($data: NewSpace!) {
    spaceCreate(data: $data) {
      id
      starterDocument {
        id
      }
    }
  }
`;
