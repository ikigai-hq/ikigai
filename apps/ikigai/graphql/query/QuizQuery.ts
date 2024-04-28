import { gql } from "@apollo/client";

export const GET_QUIZ_STATS = gql`
  query GetQuizStats($quizId: UUID!) {
    quizGetStats(quizId: $quizId) {
      options
      countAnswers
    }
  }
`;

export const GET_ANSWERS_OF_STRUCTURE = gql`
  query GetAnswersOfStructure($quizStructureId: UUID!) {
    quizGetAllStructureAnswers(quizStructureId: $quizStructureId) {
      quizId
      userId
      answer
    }
  }
`;
