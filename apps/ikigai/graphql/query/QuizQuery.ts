import { gql } from "@apollo/client";

export const GET_DOCUMENT_QUIZZES = gql`
  query GetDocumentQuizzes($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      pages {
        id
        pageContents {
          id
          quizzes {
            id
            pageContentId
            creatorId
            quizType
            questionData
            answerData
            writingQuestion {
              content
            }
            myAnswer {
              quizId
              userId
              score
            }
          }
        }
      }
    }
  }
`;
