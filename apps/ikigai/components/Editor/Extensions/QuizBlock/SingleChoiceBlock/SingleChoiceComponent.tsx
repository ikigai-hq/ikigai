import { NodeViewProps } from "@tiptap/core";
import { RadioGroup, Separator, Text } from "@radix-ui/themes";
import { useState } from "react";

import { DocumentActionPermission, QuizType } from "graphql/types";
import QuizBlockWrapper from "../QuizBlockWrapper";
import { useSingleChoiceQuiz } from "hook/UseQuiz";
import usePermission from "hook/UsePermission";
import { SingleChoiceProps } from "./type";
import SingleChoiceSetting from "./SingleChoiceSetting";

const SingleChoiceBlockComponent = (props: NodeViewProps) => {
  const allow = usePermission();
  const pageContentId = props.extension.options.pageContentId;
  const quizId = props.node.attrs.quizId;
  const [showSetting, setShowSetting] = useState(false);

  return (
    <QuizBlockWrapper
      quizType={QuizType.SINGLE_CHOICE}
      nodeViewProps={props}
      showSetting={
        props.selected && allow(DocumentActionPermission.EDIT_DOCUMENT)
      }
      onClickSetting={() => setShowSetting(!showSetting)}
    >
      <SingleChoice parentContentId={pageContentId} quizId={quizId} />
      <SingleChoiceSetting
        parentContentId={pageContentId}
        quizId={quizId}
        showSetting={showSetting}
        setShowSetting={setShowSetting}
      />
    </QuizBlockWrapper>
  );
};

export const SingleChoice = (props: SingleChoiceProps) => {
  const allow = usePermission();
  const { questionData, myAnswer, answerQuiz } = useSingleChoiceQuiz(
    props.quizId,
    props.parentContentId,
  );

  const onChange = (choice: string) => {
    answerQuiz({ choices: [choice] });
  };

  const choice = myAnswer?.choices ? myAnswer.choices[0] : undefined;
  return (
    <div style={{ padding: 10 }}>
      <Text weight="medium">Q.1: {questionData.question}</Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <RadioGroup.Root
        onValueChange={onChange}
        value={choice}
        disabled={!allow(DocumentActionPermission.INTERACTIVE_WITH_TOOL)}
      >
        {questionData.options.map((option) => (
          <RadioGroup.Item key={option.id} value={option.id}>
            {option.content}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
};

export default SingleChoiceBlockComponent;
