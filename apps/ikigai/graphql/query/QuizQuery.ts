import { gql } from "@apollo/client";

import { QUIZ_FIELDS } from "../fragment/QuizFragment";

export const GET_DOCUMENT_QUIZZES = gql`
  ${QUIZ_FIELDS}
  query GetDocumentQuizzes($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      pages {
        id
        pageContents {
          id
          quizzes {
            ...CoreQuizFields
          }
        }
      }
    }
  }
`;
