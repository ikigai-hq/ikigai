import React, { ChangeEvent, useEffect, useState } from "react";
import { Button, Divider, Radio, Space } from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleFilled,
} from "@ant-design/icons";
import styled from "styled-components";

import { Text, TextWeight } from "components/common/Text";
import { TextButton } from "components/common/Button";
import { Input } from "components/common/Input";
import { Trans, t } from "@lingui/macro";
import { useTheme } from "styled-components";

export type SingleChoiceSettingProps = {
  quizBody: any;
  quizAnswer: any;
  onChangeBody: (quizBody: any) => void;
  onchangeAnswer: (quizAnswer: any) => void;
};

const SingleChoiceSetting = (props: SingleChoiceSettingProps) => {
  const theme = useTheme();
  const { quizBody, quizAnswer, onChangeBody, onchangeAnswer } = props;

  const [options, setOptions] = useState<string[]>(quizBody);
  const [correctOption, setCorrectOption] = useState<number | undefined>(
    quizAnswer.correctOption
  );

  useEffect(() => {
    onChangeBody(options);
  }, [options]);

  useEffect(() => {
    onchangeAnswer({ correctOption });
  }, [correctOption]);

  const onAddNewOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => () => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions([...newOptions]);
  };

  const onChangeValue =
    (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const newOptions = [...options];
      newOptions[index] = e.currentTarget.value;

      setOptions(newOptions);
    };

  return (
    <div>
      <div>
        <Text level={2} strong>
          <Trans>Quick create</Trans>
        </Text>
      </div>
      <TextButton
        type="text"
        icon={<QuestionCircleFilled style={{ color: theme.colors.blue[5] }} />}
        style={{ marginTop: "5px" }}
        onClick={() => setOptions(["True", "False", "Not given"])}
      >
        <Text level={2} weight={TextWeight.bold} color={theme.colors.blue[5]}>
          <Trans>True, False, Not Given</Trans>
        </Text>
      </TextButton>
      <TextButton
        type="text"
        icon={<QuestionCircleFilled style={{ color: theme.colors.blue[5] }} />}
        style={{ marginTop: "5px" }}
        onClick={() => setOptions(["Yes", "No", "Not given"])}
      >
        <Text level={2} weight={TextWeight.bold} color={theme.colors.blue[5]}>
          <Trans>Yes, No, Not Given</Trans>
        </Text>
      </TextButton>
      <Divider />
      <div>
        <Text level={2} strong>
          <Trans>Answer</Trans>
        </Text>
      </div>
      <Trans>After providing possible answers, select the correct one.</Trans>
      <Radio.Group
        style={{ width: "100%" }}
        value={correctOption}
        onChange={(e) => setCorrectOption(e.target.value)}
      >
        <Space
          direction="vertical"
          style={{ width: "100%" }}
          key={options.length}
        >
          {options.map((option, index) => (
            <StyledRadio key={`${option}-${index}`} value={index}>
              <Input
                defaultValue={option}
                width={"100%"}
                placeholder={t`Type your answer option`}
                onBlur={onChangeValue(index)}
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                onClick={removeOption(index)}
              />
            </StyledRadio>
          ))}
        </Space>
      </Radio.Group>
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
    </div>
  );
};

const StyledRadio = styled(Radio)`
  width: 100%;
  display: flex;

  & span:nth-child(2) {
    flex: 1;
    display: flex;
    align-items: center;
  }
`;

export default SingleChoiceSetting;
