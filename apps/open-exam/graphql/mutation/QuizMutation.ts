import { gql } from "@apollo/client";

export const CREATE_QUIZ_STRUCTURE = gql`
  mutation CreateQuizStructure($data: QuizStructureInput!) {
    quizCreateStructure(data: $data) {
      id
      userId
      quizType
      quizTitle
      quizBody
      updatedAt
      createdAt
    }
  }
`;

export const CREATE_QUIZ = gql`
  mutation CreateQuiz($data: QuizInput!) {
    quizCreate(data: $data) {
      id
      documentId
      deletedAt
      structure {
        id
        userId
        quizType
        quizTitle
        quizBody
        updatedAt
        createdAt
      }
      structureAnswer
      structureExplanation
      myAnswer {
        quizId
        userId
        answer
        isCorrect
      }
      answers {
        quizId
        userId
        answer
        isCorrect
        user {
          id
          firstName
          lastName
          avatar {
            publicUrl
          }
          randomColor
        }
      }
    }
  }
`;

export const UPDATE_QUIZ_TITLE = gql`
  mutation UpdateQuizTitle($quizStructureId: UUID!, $title: String!) {
    quizUpdateTitle(quizStructureId: $quizStructureId, title: $title) {
      id
    }
  }
`;

export const ANSWER_QUIZ = gql`
  mutation AnswerQuiz($data: QuizAnswerInput!) {
    quizAnswer(data: $data) {
      quizId
      userId
      answer
    }
  }
`;

export const CLONE_QUIZ = gql`
  mutation CloneQuiz(
    $fromQuizId: UUID!
    $toQuizId: UUID!
    $toDocumentId: UUID!
  ) {
    quizClone(
      fromId: $fromQuizId
      toId: $toQuizId
      toDocumentId: $toDocumentId
    ) {
      id
      documentId
      deletedAt
      structure {
        id
        userId
        quizType
        quizTitle
        quizBody
        updatedAt
        createdAt
      }
      structureAnswer
      structureExplanation
      myAnswer {
        quizId
        userId
        answer
        isCorrect
      }
      answers {
        quizId
        userId
        answer
        isCorrect
        user {
          id
          firstName
          lastName
          avatar {
            publicUrl
          }
          randomColor
        }
      }
    }
  }
`;
