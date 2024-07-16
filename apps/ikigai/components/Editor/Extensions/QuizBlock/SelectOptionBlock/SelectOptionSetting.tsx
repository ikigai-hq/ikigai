import {
  Button,
  Checkbox,
  IconButton,
  Text,
  TextField,
} from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import React, { useState } from "react";
import toast from "react-hot-toast";

import { useSelectOptionQuiz } from "hook/UseQuiz";
import Modal from "components/base/Modal";
import { QuizComponentProps } from "../type";
import { cloneDeep } from "lodash";
import {
  ISelectOptionExpectedAnswer,
  ISelectOptionQuestion,
} from "store/QuizStore";
import { TrashIcon } from "@radix-ui/react-icons";
import { v4 } from "uuid";

export type SelectOptionSettingProps = QuizComponentProps & {
  showSetting: boolean;
  setShowSetting: (setting: boolean) => void;
};

const SelectOptionSetting = (props: SelectOptionSettingProps) => {
  const { questionData, upsertQuiz, answerData } = useSelectOptionQuiz(
    props.quizId,
    props.pageContentId,
  );
  const [innerQuestionData, setInnerQuestionData] = useState(
    cloneDeep(questionData),
  );
  const [innerAnswerData, setInnerAnswerData] = useState(cloneDeep(answerData));

  const save = async () => {
    await upsertQuiz(innerQuestionData, innerAnswerData);
    toast.success(t`Saved!`);
  };

  return (
    <Modal
      content={
        <SelectOptionSettingContent
          questionData={innerQuestionData}
          onChangeQuestionData={setInnerQuestionData}
          answerData={innerAnswerData}
          onChangeAnswerData={setInnerAnswerData}
        />
      }
      title={t`Select Option Setting`}
      open={props.showSetting}
      onOpenChange={props.setShowSetting}
      okText={t`Save`}
      onOk={save}
    >
      <></>
    </Modal>
  );
};

export type SelectOptionSettingContentProps = {
  questionData: ISelectOptionQuestion;
  onChangeQuestionData: (questionData: ISelectOptionQuestion) => void;
  answerData: ISelectOptionExpectedAnswer;
  onChangeAnswerData: (answerData: ISelectOptionExpectedAnswer) => void;
};

const SelectOptionSettingContent = ({
  questionData,
  answerData,
  onChangeAnswerData,
  onChangeQuestionData,
}: SelectOptionSettingContentProps) => {
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
    const expectedChoices = answerData.expectedChoices;
    const index = answerData.expectedChoices.indexOf(id);
    if (checked) {
      if (index === -1) expectedChoices.push(id);
    } else if (index > -1) expectedChoices.splice(index, 1);

    onChangeAnswerData({ ...answerData });
  };

  return (
    <div>
      <Text size="2" weight="bold">
        <Trans>Answer Options</Trans>
      </Text>
      <div>
        <Text color="gray" size="2">
          <Trans>Checked option is correct option</Trans>
        </Text>
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
              checked={answerData.expectedChoices?.includes(option.id)}
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
      <div style={{ marginTop: 5 }}>
        <Button variant="soft" onClick={addNewOption}>
          <Trans>Add option</Trans>
        </Button>
      </div>
    </div>
  );
};

export default SelectOptionSetting;
