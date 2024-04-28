import { gql } from "@apollo/client";

export const GET_HIGHLIGHT_DOCUMENT = gql`
  query GetHighlightDocument($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      highlights {
        threadId
        uuid
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
            createdAt
            content
            commentType
            sender {
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
          }
        }
      }
    }
  }
`;
