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
            myAnswer {
              quizId
              userId
              score
              writingAnswerData {
                content
              }
            }
          }
        }
      }
    }
  }
`;
