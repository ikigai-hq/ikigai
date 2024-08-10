import { gql } from "@apollo/client";

import { QUIZ_FIELDS, QUIZ_USER_ANSWER_FIELDS } from "../fragment/QuizFragment";

export const UPSERT_QUIZ = gql`
  ${QUIZ_FIELDS}
  mutation UpsertQuiz($pageContentId: UUID!, $data: QuizInput!) {
    quizUpsert(pageContentId: $pageContentId, data: $data) {
      ...CoreQuizFields
    }
  }
`;

export const CLONE_QUIZ = gql`
  ${QUIZ_FIELDS}
  mutation CloneQuiz(
    $quizId: UUID!
    $newQuizId: UUID!
    $newPageContentId: UUID!
  ) {
    quizClone(
      quizId: $quizId
      newQuizId: $newQuizId
      newPageContentId: $newPageContentId
    ) {
      ...CoreQuizFields
    }
  }
`;

export const ANSWER_QUIZ = gql`
  ${QUIZ_USER_ANSWER_FIELDS}
  mutation AnswerQuiz($data: QuizUserAnswerInput!) {
    quizAnswer(data: $data) {
      ...CoreQuizUserAnswerFields
    }
  }
`;

export const CONVERT_AI_QUIZ = gql`
  ${QUIZ_FIELDS}
  mutation ConvertAIQuiz($pageContentId: UUID!, $data: AIGenerateQuizInput!) {
    quizConvertAiQuiz(pageContentId: $pageContentId, data: $data) {
      ...CoreQuizFields
    }
  }
`;
