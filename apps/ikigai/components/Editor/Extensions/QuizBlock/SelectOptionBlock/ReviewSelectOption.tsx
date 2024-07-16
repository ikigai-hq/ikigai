import { Kbd, Select, Strong, Text } from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";

import { useSelectOptionQuiz } from "hook/UseQuiz";
import { QuizComponentProps } from "../type";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import React from "react";
import { processReviewAnswer } from "../QuizBlockWrapper";

export type ReviewSelectOptionProps = QuizComponentProps & {
  userId: number;
};

const ReviewSelectOption = (props: ReviewSelectOptionProps) => {
  const allow = usePermission();
  const { questionData, quiz, answerData } = useSelectOptionQuiz(
    props.quizId,
    props.pageContentId,
  );

  const answer = quiz?.answers?.find(
    (answer) => answer.userId === props.userId,
  );
  const choice = answer?.selectOptionAnswer
    ? answer.selectOptionAnswer.choice
    : null;

  const { isCorrect, color, explainAnswer } = processReviewAnswer(
    answer,
    questionData,
    answerData,
  );

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Kbd>Q.{props.quizIndex + 1}</Kbd>
      <Select.Root size="1" value={choice}>
        <Select.Trigger
          variant="soft"
          placeholder={t`Select answer`}
          radius="none"
          color={color}
        />
        <Select.Content position="popper">
          <Select.Group>
            {questionData.options.map((option) => (
              <Select.Item key={option.id} value={option.id}>
                {option.content}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>
      {allow(DocumentActionPermission.VIEW_ANSWER) && isCorrect && (
        <Text color="green" size="2">
          <Trans>Correct!</Trans>
        </Text>
      )}
      {allow(DocumentActionPermission.VIEW_ANSWER) && !isCorrect && (
        <Text color="red" size="2">
          <Trans>
            Incorrect! Correct answer is <Strong>{explainAnswer}</Strong>
          </Trans>
        </Text>
      )}
    </div>
  );
};

export default ReviewSelectOption;
