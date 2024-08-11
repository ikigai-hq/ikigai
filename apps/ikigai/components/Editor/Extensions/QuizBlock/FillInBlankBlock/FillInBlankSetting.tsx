import { Button, IconButton, Text, TextField } from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { TrashIcon } from "@radix-ui/react-icons";
import { v4 } from "uuid";
import { cloneDeep } from "lodash";

import { useFillInBlankQuiz } from "hook/UseQuiz";
import Modal from "components/base/Modal";
import { QuizComponentProps } from "../type";
import { IFillInBlankExpectedAnswer } from "store/QuizStore";

export type FillInBlankSettingProps = QuizComponentProps & {
  showSetting: boolean;
  setShowSetting: (setting: boolean) => void;
};

const FillInBlankSetting = (props: FillInBlankSettingProps) => {
  const { upsertQuiz, answerData } = useFillInBlankQuiz(
    props.quizId,
    props.pageContentId,
  );
  const [innerAnswerData, setInnerAnswerData] = useState(cloneDeep(answerData));

  const save = async () => {
    await upsertQuiz({ content: "" }, innerAnswerData);
    toast.success(t`Saved!`);
  };

  return (
    <Modal
      content={
        <FillInBlankSettingContent
          answerData={innerAnswerData}
          onChangeAnswerData={setInnerAnswerData}
        />
      }
      title={t`Fill in Blank Setting`}
      open={props.showSetting}
      onOpenChange={props.setShowSetting}
      okText={t`Save`}
      onOk={save}
    >
      <></>
    </Modal>
  );
};

export type FillInBlankSettingContentProps = {
  answerData: IFillInBlankExpectedAnswer;
  onChangeAnswerData: (answerData: IFillInBlankExpectedAnswer) => void;
};

const FillInBlankSettingContent = ({
  answerData,
  onChangeAnswerData,
}: FillInBlankSettingContentProps) => {
  const addNewOption = () => {
    answerData.expectedAnswers.push({
      id: v4(),
      content: "",
    });
    onChangeAnswerData({ ...answerData });
  };

  const removeOption = (id: string) => {
    const index = answerData.expectedAnswers.findIndex(
      (option) => option.id === id,
    );
    if (index > -1) answerData.expectedAnswers.splice(index, 1);
    onChangeAnswerData({ ...answerData });
  };

  const updateOption = (id: string, content: string) => {
    const option = answerData.expectedAnswers.find(
      (option) => option.id === id,
    );
    if (option) {
      option.content = content;
    }
    onChangeAnswerData({ ...answerData });
  };

  return (
    <div>
      <Text size="2" weight="bold">
        <Trans>Answer Options</Trans>
      </Text>
      <div>
        <Text color="gray" size="2">
          <Trans>Type all your answer options</Trans>
        </Text>
        {answerData.expectedAnswers.map((expectedAnswer) => (
          <div
            key={expectedAnswer.id}
            style={{
              display: "flex",
              gap: 5,
              alignItems: "center",
              marginTop: 5,
            }}
          >
            <TextField.Root
              placeholder={t`Type answer option`}
              value={expectedAnswer.content}
              key={expectedAnswer.id}
              onChange={(e) =>
                updateOption(expectedAnswer.id, e.currentTarget.value)
              }
              style={{ flex: 1 }}
            />
            <div>
              <IconButton
                variant={"soft"}
                color={"red"}
                onClick={() => removeOption(expectedAnswer.id)}
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

export default FillInBlankSetting;
