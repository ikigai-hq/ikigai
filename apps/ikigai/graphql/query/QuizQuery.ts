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
            singleChoiceQuestion {
              question
              options {
                id
                content
              }
            }
            singleChoiceExpectedAnswer {
              expectedChoices
            }
            myAnswer {
              quizId
              userId
              score
              answerData
              singleChoiceAnswer {
                choices
              }
            }
          }
        }
      }
    }
  }
`;
