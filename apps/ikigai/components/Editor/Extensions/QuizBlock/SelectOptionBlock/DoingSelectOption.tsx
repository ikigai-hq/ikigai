import { Kbd, Select } from "@radix-ui/themes";
import { t } from "@lingui/macro";
import React from "react";

import { QuizComponentProps } from "../type";
import usePermission from "hook/UsePermission";
import { useSelectOptionQuiz } from "hook/UseQuiz";
import { DocumentActionPermission } from "graphql/types";

const DoingSelectOption = (props: QuizComponentProps) => {
  const allow = usePermission();
  const { questionData, myAnswer, answerQuiz } = useSelectOptionQuiz(
    props.quizId,
    props.pageContentId,
  );

  const onChange = (choice: string) => {
    answerQuiz({ choice });
  };

  const choice = myAnswer?.choice || undefined;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Kbd>Q.{props.quizIndex + 1}</Kbd>
      <Select.Root
        size="1"
        onValueChange={onChange}
        value={choice}
        disabled={!allow(DocumentActionPermission.INTERACTIVE_WITH_TOOL)}
      >
        <Select.Trigger
          variant="soft"
          placeholder={t`Select answer`}
          radius="none"
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
    </div>
  );
};

export default DoingSelectOption;
