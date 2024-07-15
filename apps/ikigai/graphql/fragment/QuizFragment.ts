import { gql } from "@apollo/client";

export const QUIZ_USER_ANSWER_FIELDS = gql`
  fragment CoreQuizUserAnswerFields on QuizUserAnswer {
    quizId
    userId
    score
    answerData
    singleChoiceAnswer {
      choices
    }
    multipleChoiceAnswer {
      choices
    }
  }
`;

export const QUIZ_FIELDS = gql`
  ${QUIZ_USER_ANSWER_FIELDS}
  fragment CoreQuizFields on Quiz {
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
    multipleChoiceQuestion {
      question
      options {
        id
        content
      }
    }
    multipleChoiceExpectedAnswer {
      expectedChoices
    }
    myAnswer {
      ...CoreQuizUserAnswerFields
    }
    answers {
      ...CoreQuizUserAnswerFields
    }
  }
`;
