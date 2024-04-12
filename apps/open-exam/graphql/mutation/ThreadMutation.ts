import { gql } from "@apollo/client";

export const CREATE_COMMENT = gql`
  mutation CreateComment($newComment: NewComment!) {
    addComment(newComment: $newComment) {
      id
      createdAt
      content
      commentType
      sender {
        id
        firstName
        lastName
        avatar {
          publicUrl
        }
        orgPersonalInformation {
          fullName
          avatar {
            publicUrl
          }
        }
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: Int!) {
    removeComment(commentId: $commentId)
  }
`;

export const ADD_HIGHLIGHT_DOC = gql`
  mutation AddHighlightDoc($newHighlight: NewDocumentHighlight!) {
    documentAddHighlight(newHighlight: $newHighlight) {
      uuid
      documentId
      threadId
      fromPos
      toPos
      thread {
        id
        title
        createdAt
        creator {
          id
          avatar {
            publicUrl
          }
          firstName
          lastName
          orgPersonalInformation {
            fullName
            avatar {
              publicUrl
            }
          }
        }
        comments {
          id
          threadId
          content
          createdAt
          commentType
          sender {
            id
            firstName
            lastName
            avatar {
              publicUrl
            }
            orgPersonalInformation {
              fullName
              avatar {
                publicUrl
              }
            }
          }
        }
      }
    }
  }
`;

export const REMOVE_HIGHLIGHT_DOC = gql`
  mutation RemoveHighlightDoc($highlightId: UUID!) {
    documentRemoveHighlight(highlightId: $highlightId)
  }
`;
