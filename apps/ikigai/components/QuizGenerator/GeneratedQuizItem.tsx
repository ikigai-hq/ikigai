import {
  CheckboxGroup,
  Kbd,
  RadioGroup,
  Select,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import styled from "styled-components";
import { t, Trans } from "@lingui/macro";
import React from "react";

import {
  AIFillInBlankQuiz,
  AIGeneratedQuiz,
  AIMultipleChoiceQuiz,
  AISelectOptionQuiz,
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

  if (props.quiz.quizType === QuizType.SELECT_OPTION) {
    return <GeneratedSelectOptionReview {...props} />;
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
  const components = parseAIFillInBlankQuiz(quizData);
  return (
    <QuizWrapper $selected={selected} onClick={onSelect}>
      {components.map((component, index) =>
        component.componentType === "text" ? (
          <Text key={index}>{component.data.content}</Text>
        ) : (
          <GeneratedFillInBlankQuizReview
            key={index}
            item={component.data as AIFillInBlankQuizContentComponent}
          />
        ),
      )}
    </QuizWrapper>
  );
};

export const GeneratedFillInBlankQuizReview = ({
  item,
}: {
  item: AIFillInBlankQuizContentComponent;
}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Kbd>Q.{item.position}</Kbd>
      <TextField.Root size="1" variant="soft" value={item.content} readOnly />
    </div>
  );
};

export type AIFillInBlankQuizContentComponent = {
  content: string;
  position: number;
};

export type AIFillInBlankQuizComponent = {
  componentType: "text" | "quiz";
  data: { content: string } | AIFillInBlankQuizContentComponent;
};

export const parseAIFillInBlankQuiz = (
  quiz: AIFillInBlankQuiz,
): AIFillInBlankQuizComponent[] => {
  const extractQuizRegex = /(\[Q\.\d*\])/gm;

  const components = quiz.content.split(extractQuizRegex);
  return components.map((component) => {
    const index = component.search(extractQuizRegex);
    if (index > -1) {
      let quizNumberStr = component.replace("[Q.", "");
      quizNumberStr = quizNumberStr.replace("]", "");
      const quizNumber = parseInt(quizNumberStr) || 0;
      return {
        componentType: "quiz",
        data: {
          content: quiz.quizzes.find((quiz) => quiz.position === quizNumber)
            ?.correctAnswer,
          position: quizNumber,
        },
      };
    }
    return {
      componentType: "text",
      data: { content: component },
    };
  });
};

export const GeneratedSelectOptionReview = ({
  quiz,
  selected,
  onSelect,
}: GeneratedChoiceReviewProps) => {
  const quizData = quiz as AISelectOptionQuiz;
  const components = parseAISelectOptionQuiz(quizData);
  return (
    <QuizWrapper $selected={selected} onClick={onSelect}>
      {components.map((component, index) =>
        component.componentType === "text" ? (
          <Text key={index}>{component.data.content}</Text>
        ) : (
          <GeneratedSelectOptionQuizReview
            key={index}
            item={component.data as AISelectOptionQuizContentComponent}
          />
        ),
      )}
    </QuizWrapper>
  );
};

export const GeneratedSelectOptionQuizReview = ({
  item,
}: {
  item: AISelectOptionQuizContentComponent;
}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Kbd>Q.{item.position}</Kbd>
      <Select.Root size="1" value={item.correctAnswer}>
        <Select.Trigger
          variant="soft"
          placeholder={t`Select answer`}
          radius="none"
          onClick={(e) => e.stopPropagation()}
        />
        <Select.Content position="popper">
          <Select.Group>
            {item.answers.map((answer) => (
              <Select.Item key={answer} value={answer}>
                {answer}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
  );
};

export type AISelectOptionQuizContentComponent = {
  content: string;
  position: number;
  answers: string[];
  correctAnswer: string;
};

export type AISelectOptionQuizComponent = {
  componentType: "text" | "quiz";
  data: { content: string } | AIFillInBlankQuizContentComponent;
};

export const parseAISelectOptionQuiz = (
  quiz: AISelectOptionQuiz,
): AISelectOptionQuizComponent[] => {
  const extractQuizRegex = /(\[Q\.\d*\])/gm;

  const components = quiz.content.split(extractQuizRegex);
  return components.map((component) => {
    const index = component.search(extractQuizRegex);
    if (index > -1) {
      let quizNumberStr = component.replace("[Q.", "");
      quizNumberStr = quizNumberStr.replace("]", "");
      const quizNumber = parseInt(quizNumberStr) || 0;
      return {
        componentType: "quiz",
        data: {
          content: quiz.quizzes.find((quiz) => quiz.position === quizNumber)
            ?.correctAnswer,
          position: quizNumber,
          correctAnswer: quiz.quizzes.find(
            (quiz) => quiz.position === quizNumber,
          )?.correctAnswer,
          answers: quiz.quizzes.find((quiz) => quiz.position === quizNumber)
            ?.answers,
        },
      };
    }
    return {
      componentType: "text",
      data: { content: component },
    };
  });
};

const QuizWrapper = styled.div<{ $selected?: boolean }>`
  border: ${(props) =>
    props.$selected ? "1px solid var(--indigo-9)" : "1px solid var(--gray-5)"};
  padding: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
  cursor: pointer;
`;
