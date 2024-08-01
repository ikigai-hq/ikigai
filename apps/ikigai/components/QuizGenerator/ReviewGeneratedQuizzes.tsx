import {
  GenerateQuizzes,
  GenerateQuizzes_documentGenerateQuizzes_quizzes as IGeneratedQuizz,
} from "graphql/types";
import {
  Button,
  CheckboxGroup,
  Kbd,
  RadioGroup,
  ScrollArea,
  Separator,
  Text,
} from "@radix-ui/themes";
import { Trans } from "@lingui/macro";
import styled from "styled-components";
import { useState } from "react";

export type ReviewGeneratedQuizzesProps = {
  data: GenerateQuizzes;
  onClose: () => void;
};

export const ReviewGeneratedQuizzes = ({
  data,
  onClose,
}: ReviewGeneratedQuizzesProps) => {
  const [selectedQuizzes, setSelectedQuizzes] = useState({});

  const onSelect = (index: number) => {
    const selected = selectedQuizzes[index];
    selectedQuizzes[index] = !selected;
    setSelectedQuizzes({ ...selectedQuizzes });
  };

  return (
    <div>
      <ScrollArea
        scrollbars="vertical"
        style={{ height: "70vh", paddingRight: 3 }}
      >
        {data.documentGenerateQuizzes.quizzes.map((quiz, index) =>
          quiz.correctAnswer ? (
            <GeneratedSingleChoiceReview
              index={index}
              quiz={quiz}
              key={index}
              selected={selectedQuizzes[index]}
              onSelect={() => onSelect(index)}
            />
          ) : (
            <GeneratedMultipleChoiceReview
              index={index}
              quiz={quiz}
              key={index}
              selected={selectedQuizzes[index]}
              onSelect={() => onSelect(index)}
            />
          ),
        )}
      </ScrollArea>
      <div style={{ display: "flex", gap: 5, justifyContent: "right" }}>
        <Button variant={"soft"} color={"gray"} onClick={onClose}>
          <Trans>Close</Trans>
        </Button>
        <Button>
          <Trans>Insert</Trans>
        </Button>
      </div>
    </div>
  );
};

export type GeneratedChoiceReviewProps = {
  index: number;
  quiz: IGeneratedQuizz;
  selected?: boolean;
  onSelect?: () => void;
};

const GeneratedSingleChoiceReview = ({
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

const GeneratedMultipleChoiceReview = ({
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
