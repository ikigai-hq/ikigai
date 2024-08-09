import {
  CheckboxGroup,
  Kbd,
  RadioGroup,
  Separator,
  Text,
} from "@radix-ui/themes";
import styled from "styled-components";
import { Trans } from "@lingui/macro";

import {
  AIFillInBlankQuiz,
  AIGeneratedQuiz,
  AIMultipleChoiceQuiz,
  AISingeChoiceQuiz,
} from "store/QuizStore";
import { QuizType } from "graphql/types";

export type GeneratedChoiceReviewProps = {
  index: number;
  quiz: AIGeneratedQuiz;
  selected?: boolean;
  onSelect?: () => void;
};

export const GeneratedQuizReview = (props: GeneratedChoiceReviewProps) => {
  if (props.quiz.quizType === QuizType.SINGLE_CHOICE) {
    return <GeneratedSingleChoiceReview {...props} />;
  }

  if (props.quiz.quizType === QuizType.MULTIPLE_CHOICE) {
    return <GeneratedMultipleChoiceReview {...props} />;
  }

  if (props.quiz.quizType === QuizType.FILL_IN_BLANK) {
    return <GeneratedFillInBlankReview {...props} />;
  }

  return (
    <QuizWrapper onClick={props.onSelect} $selected={props.selected}>
      <Trans>Not supported quiz type</Trans>
    </QuizWrapper>
  );
};

export const GeneratedSingleChoiceReview = ({
  index,
  quiz,
  selected,
  onSelect,
}: GeneratedChoiceReviewProps) => {
  const quizData = quiz as AISingeChoiceQuiz;
  return (
    <QuizWrapper onClick={onSelect} $selected={selected}>
      <Text weight="medium">
        <Kbd>Q.{index + 1}</Kbd> {quizData.question}
      </Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <RadioGroup.Root variant="soft" value={quizData.correctAnswer}>
        {quizData.answers.map((option) => (
          <RadioGroup.Item key={option} value={option}>
            {option}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </QuizWrapper>
  );
};

export const GeneratedMultipleChoiceReview = ({
  index,
  quiz,
  selected,
  onSelect,
}: GeneratedChoiceReviewProps) => {
  const quizData = quiz as AIMultipleChoiceQuiz;
  return (
    <QuizWrapper $selected={selected} onSelect={onSelect}>
      <Text weight="medium">
        <Kbd>Q.{index + 1}</Kbd> {quizData.question}
      </Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <CheckboxGroup.Root variant="soft" value={quizData.correctAnswers}>
        {quizData.answers.map((option) => (
          <CheckboxGroup.Item key={option} value={option}>
            {option}
          </CheckboxGroup.Item>
        ))}
      </CheckboxGroup.Root>
    </QuizWrapper>
  );
};

export const GeneratedFillInBlankReview = ({
  quiz,
  selected,
  onSelect,
}: GeneratedChoiceReviewProps) => {
  const quizData = quiz as AIFillInBlankQuiz;
  let content = quizData.content;
  quizData.quizzes.forEach((quiz) => {
    content = content.replace(
      `[Q.${quiz.position}]`,
      `[Q.${quiz.position} ${quiz.correctAnswer}]`,
    );
  });
  return (
    <QuizWrapper $selected={selected} onClick={onSelect}>
      <Text>{content}</Text>
    </QuizWrapper>
  );
};

const QuizWrapper = styled.div<{ $selected?: boolean }>`
  border: ${(props) =>
    props.$selected ? "1px solid var(--indigo-9)" : "1px solid var(--gray-5)"};
  padding: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
  cursor: pointer;
`;
