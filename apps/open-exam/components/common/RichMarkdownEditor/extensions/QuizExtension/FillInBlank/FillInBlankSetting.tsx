import { Button, Divider, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { Button as StyledButton, TextButton } from "components/common/Button";
import Modal from "components/common/Modal";
import { Text, TextWeight } from "components/common/Text";
import { Input, InputArea } from "components/common/Input";
import { CreateQuizStructure } from "graphql/types";
import { Trans, t } from "@lingui/macro";
import { useTheme } from "styled-components";
import useQuizStore from "context/ZustandQuizStore";
import { useMutation } from "@apollo/client";
import { CREATE_QUIZ_STRUCTURE } from "graphql/mutation";
import { handleError } from "graphql/ApolloClient";

export type FillBlankSettingProps = {
  quizId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const FillInBlankSetting = ({
  open,
  quizId,
  setOpen,
}: FillBlankSettingProps) => {
  const theme = useTheme();

  const quizData = useQuizStore((state) => state.quizzes.get(quizId));
  const updateQuizzes = useQuizStore((state) => state.updateQuizzes);

  const [correctOptions, setCorrectOptions] = useState<string[]>([]);

  const [explanation, setExplanation] = useState(
    quizData?.structureExplanation || "",
  );

  useEffect(() => {
    const initialCorrectAnswers = quizData?.structureAnswer?.correctOptions
      ? quizData.structureAnswer.correctOptions
      : [""];
    setCorrectOptions(initialCorrectAnswers);
  }, [quizData]);

  const [createQuizStructure, { loading }] = useMutation<CreateQuizStructure>(
    CREATE_QUIZ_STRUCTURE,
    {
      onError: handleError,
    },
  );

  const onAddNewOption = () => {
    setCorrectOptions([...correctOptions, ""]);
  };

  const removeOption = (index: number) => () => {
    const newOptions = [...correctOptions];
    newOptions.splice(index, 1);
    setCorrectOptions([...newOptions]);
  };

  const onChangeValue = (index: number, value: string) => {
    const newCorrectOptions = [...correctOptions];
    newCorrectOptions[index] = value;
    setCorrectOptions(newCorrectOptions);
  };

  const save = async () => {
    const res = await createQuizStructure({
      variables: {
        data: {
          id: quizData?.structure?.id,
          quizType: quizData?.structure?.quizType,
          quizTitle: quizData?.structure?.quizTitle,
          quizBody: quizData?.structure?.quizBody,
          quizAnswer: { correctOptions },
          explanation: explanation,
        },
      },
    });
    if (res?.data) {
      updateQuizzes([], {
        ...quizData,
        structure: res.data.quizCreateStructure,
        structureAnswer: { correctOptions },
        structureExplanation: explanation,
      });
    }
    setOpen(false);
  };

  return (
    <Modal
      title={t`Answers`}
      visible={open}
      onClose={() => setOpen(false)}
      width={865}
    >
      <Typography.Text type="secondary">
        <Trans>
          The option that accepts input with sensitive (uppercase and lowercase)
          characters and trims leading and trailing spaces.
        </Trans>
      </Typography.Text>
      {correctOptions.map((option, index) => (
        <div
          style={{ display: "flex", alignItems: "center" }}
          key={`${index}`}
        >
          <Input
            value={option}
            width={"100%"}
            placeholder={t`Type your answer option`}
            onChange={(e) => onChangeValue(index, e.target.value)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={removeOption(index)}
          />
        </div>
      ))}
      <TextButton
        type="text"
        icon={<PlusOutlined style={{ color: theme.colors.blue[5] }} />}
        onClick={onAddNewOption}
        style={{ marginTop: "5px" }}
      >
        <Text level={2} weight={TextWeight.bold} color={theme.colors.blue[5]}>
          <Trans>New Option</Trans>
        </Text>
      </TextButton>
      <Divider />
      <Text level={2} strong>
        <Trans>Answer explanation</Trans>
      </Text>
      <InputArea
        placeholder={t`Explain your answer`}
        value={explanation}
        onChange={(e) => setExplanation(e.currentTarget.value)}
      />
      <Divider />
      <StyledButton
        type="primary"
        style={{ float: "right" }}
        loading={loading}
        onClick={save}
      >
        <Trans>Save</Trans>
      </StyledButton>
    </Modal>
  );
};

export default FillInBlankSetting;
