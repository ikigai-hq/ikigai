import { Kbd, TextField } from "@radix-ui/themes";
import React from "react";
import { t } from "@lingui/macro";

import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import { QuizComponentProps } from "../type";
import { useFillInBlankQuiz } from "hook/UseQuiz";

const DoingFillInBlank = (props: QuizComponentProps) => {
  const allow = usePermission();
  const { myAnswer, debounceAnswerQuiz } = useFillInBlankQuiz(
    props.quizId,
    props.pageContentId,
  );

  const answer = (value: string) => {
    debounceAnswerQuiz({ answer: value });
  };

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
        placeholder={t`Type answer`}
        disabled={!allow(DocumentActionPermission.INTERACTIVE_WITH_TOOL)}
        defaultValue={myAnswer?.answer}
        onChange={(e) => answer(e.currentTarget.value)}
      />
    </div>
  );
};

export default DoingFillInBlank;
