import { Kbd, Strong, Text, TextField } from "@radix-ui/themes";
import { Trans } from "@lingui/macro";
import React from "react";

import { QuizComponentProps } from "../type";
import { useFillInBlankQuiz } from "hook/UseQuiz";
import { getQuizColor } from "util/DocumentUtil";
import { DocumentActionPermission } from "graphql/types";
import usePermission from "hook/UsePermission";

export type ReviewFillInBlankProps = QuizComponentProps & {
  userId: number;
};
const ReviewFillInBlank = (props: ReviewFillInBlankProps) => {
  const allow = usePermission();
  const { quiz, answerData } = useFillInBlankQuiz(
    props.quizId,
    props.pageContentId,
  );

  const answer = quiz?.answers?.find(
    (answer) => answer.userId === props.userId,
  );

  const isCorrect = !!answer?.score;
  const color = getQuizColor(answer);
  const explainAnswer = answerData.expectedAnswers
    .map((answer) => answer.content)
    .join(",");

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Kbd>Q.{props.quizIndex + 1}</Kbd>
      <TextField.Root
        size="1"
        variant="soft"
        value={answer?.fillInBlankAnswer?.answer}
        color={color}
        disabled
      />
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

export default ReviewFillInBlank;
