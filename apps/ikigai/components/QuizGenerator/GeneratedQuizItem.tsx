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
  GenerateQuizzes_quizGenerateByAi_quizzes as IGeneratedQuiz,
  QuizType,
} from "graphql/types";

export type GeneratedChoiceReviewProps = {
  index: number;
  quiz: IGeneratedQuiz;
  selected?: boolean;
  onSelect?: () => void;
};

export const GeneratedQuizReview = (props: GeneratedChoiceReviewProps) => {
  const quizType = props.quiz.quizType;
  if (quizType === QuizType.SINGLE_CHOICE) {
    return <GeneratedSingleChoiceReview {...props} />;
  }

  if (quizType === QuizType.MULTIPLE_CHOICE) {
    return <GeneratedMultipleChoiceReview {...props} />;
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
  return (
    <QuizWrapper onClick={onSelect} $selected={selected}>
      <Text weight="medium">
        <Kbd>Q.{index + 1}</Kbd> {quiz.question}
      </Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <RadioGroup.Root variant="soft" value={quiz.correctAnswer}>
        {quiz.answers.map((option) => (
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
  return (
    <QuizWrapper $selected={selected} onSelect={onSelect}>
      <Text weight="medium">
        <Kbd>Q.{index + 1}</Kbd> {quiz.question}
      </Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <CheckboxGroup.Root variant="soft" value={quiz.correctAnswers}>
        {quiz.answers.map((option) => (
          <CheckboxGroup.Item key={option} value={option}>
            {option}
          </CheckboxGroup.Item>
        ))}
      </CheckboxGroup.Root>
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
