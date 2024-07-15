import { useSingleChoiceQuiz } from "hook/UseQuiz";
import React, { useState } from "react";
import { cloneDeep } from "lodash";
import { v4 } from "uuid";
import {
  Button,
  Checkbox,
  IconButton,
  Text,
  TextField,
} from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";
import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";

import Modal from "components/base/Modal";
import { SingleChoiceProps } from "./type";
import {
  ISingleChoiceExpectedAnswer,
  ISingleChoiceQuestion,
} from "store/QuizStore";

export type SingleChoiceSettingProps = SingleChoiceProps & {
  showSetting: boolean;
  setShowSetting: (setting: boolean) => void;
};

const SingleChoiceSetting = (props: SingleChoiceSettingProps) => {
  const { questionData, answerData, upsertQuiz } = useSingleChoiceQuiz(
    props.quizId,
    props.parentContentId,
  );
  const [innerQuestion, setInnerQuestion] = useState(cloneDeep(questionData));
  const [innerExpectedAnswer, setInnerExpectedAnswer] = useState(
    cloneDeep(answerData),
  );

  const onSave = async () => {
    await upsertQuiz(innerQuestion, innerExpectedAnswer);
    toast.success(t`Saved!`);
  };

  return (
    <Modal
      content={
        <SingleChoiceSettingContent
          questionData={innerQuestion}
          onChangeQuestionData={setInnerQuestion}
          innerExpectedAnswer={innerExpectedAnswer}
          onChangeExpectedAnswer={setInnerExpectedAnswer}
        />
      }
      open={props.showSetting}
      onOpenChange={props.setShowSetting}
      title={t`Single Choice Setting`}
      description={t`Declare your question, options, and then choose the correct answer.`}
      onOk={onSave}
      okText={"Save"}
    >
      <></>
    </Modal>
  );
};

type SingleChoiceSettingContentProps = {
  questionData: ISingleChoiceQuestion;
  onChangeQuestionData: (data: ISingleChoiceQuestion) => void;
  innerExpectedAnswer: ISingleChoiceExpectedAnswer;
  onChangeExpectedAnswer: (data: ISingleChoiceExpectedAnswer) => void;
};

const SingleChoiceSettingContent = ({
  questionData,
  onChangeQuestionData,
  innerExpectedAnswer,
  onChangeExpectedAnswer,
}: SingleChoiceSettingContentProps) => {
  const onChangeQuestion = (question: string) => {
    questionData.question = question;
    onChangeQuestionData({ ...questionData });
  };

  const addNewOption = () => {
    questionData.options.push({
      id: v4(),
      content: "",
    });
    onChangeQuestionData({ ...questionData });
  };

  const removeOption = (id: string) => {
    const index = questionData.options.findIndex((option) => option.id === id);
    if (index > -1) questionData.options.splice(index, 1);
    onChangeQuestionData({ ...questionData });
  };

  const updateOption = (id: string, content: string) => {
    const option = questionData.options.find((option) => option.id === id);
    if (option) {
      option.content = content;
    }
    onChangeQuestionData({ ...questionData });
  };

  const onChangeExpectedChoice = (id: string, checked: boolean | string) => {
    const expectedChoices = innerExpectedAnswer.expectedChoices;
    const index = innerExpectedAnswer.expectedChoices.indexOf(id);
    if (checked) {
      if (index === -1) expectedChoices.push(id);
    } else if (index > -1) expectedChoices.splice(index, 1);

    onChangeExpectedAnswer({ ...innerExpectedAnswer });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <Text size="2" weight="bold">
          <Trans>Question</Trans>
        </Text>
        <TextField.Root
          value={questionData.question}
          onChange={(e) => onChangeQuestion(e.currentTarget.value)}
          placeholder={t`Type your question...`}
        />
      </div>
      <div>
        <Text size="2" weight="bold">
          <Trans>Answer Options</Trans>
        </Text>
        <div>
          <Text color="gray" size="2">
            <Trans>Checked option is correct option</Trans>
          </Text>
        </div>
        {questionData.options.map((option) => (
          <div
            key={option.id}
            style={{
              display: "flex",
              gap: 5,
              alignItems: "center",
              marginTop: 5,
            }}
          >
            <Checkbox
              size="3"
              checked={innerExpectedAnswer.expectedChoices?.includes(option.id)}
              onCheckedChange={(e) => onChangeExpectedChoice(option.id, e)}
            />
            <TextField.Root
              placeholder={t`Type option`}
              value={option.content}
              key={option.id}
              onChange={(e) => updateOption(option.id, e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <div>
              <IconButton
                variant={"soft"}
                color={"red"}
                onClick={() => removeOption(option.id)}
              >
                <TrashIcon />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
      <div>
        <Button variant="soft" onClick={addNewOption}>
          <Trans>Add option</Trans>
        </Button>
      </div>
    </div>
  );
};

export default SingleChoiceSetting;
