import { gql } from "@apollo/client";

export const UPSERT_QUIZ = gql`
  mutation UpsertQuiz($pageContentId: UUID!, $data: QuizInput!) {
    quizUpsert(pageContentId: $pageContentId, data: $data) {
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
      }
    }
  }
`;

export const CLONE_QUIZ = gql`
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
      }
    }
  }
`;

export const ANSWER_QUIZ = gql`
  mutation AnswerQuiz($data: QuizUserAnswerInput!) {
    quizAnswer(data: $data) {
      quizId
      userId
      score
    }
  }
`;
