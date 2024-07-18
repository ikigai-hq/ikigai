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
    selectOptionAnswer {
      choice
    }
    fillInBlankAnswer {
      answer
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
    selectOptionQuestion {
      options {
        id
        content
      }
    }
    selectOptionExpectedAnswer {
      expectedChoices
    }
    fillInBlankQuestion {
      content
    }
    fillInBlankExpectedAnswer {
      expectedAnswers {
        id
        content
      }
    }
    myAnswer {
      ...CoreQuizUserAnswerFields
    }
    answers {
      ...CoreQuizUserAnswerFields
    }
  }
`;
