import React, { ChangeEvent, useEffect, useState } from "react";
import { Button, Checkbox, Space } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import styled, { useTheme } from "styled-components";

import { Text, TextWeight } from "components/common/Text";
import { TextButton } from "components/common/Button";
import { Input } from "components/common/Input";
import { CheckboxChangeEvent } from "antd/lib/checkbox/Checkbox";
import { Trans, t } from "@lingui/macro";

export type MultipleChoiceSettingProps = {
  quizBody: any;
  quizAnswer: any;
  onChangeBody: (quizBody: any) => void;
  onchangeAnswer: (quizAnswer: any) => void;
};

const MultipleChoiceSetting = (props: MultipleChoiceSettingProps) => {
  const theme = useTheme();
  const { quizBody, quizAnswer, onChangeBody, onchangeAnswer } = props;

  const [options, setOptions] = useState<string[]>(quizBody);

  const [correctOptions, setCorrectOptions] = useState<number[] | undefined>(quizAnswer.correctOptions || []);

  useEffect(() => {
    onChangeBody(options);
  }, [options]);

  useEffect(() => {
    onchangeAnswer({ correctOptions });
  }, [correctOptions]);

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

  const onChangeCorrectOption = (index: number) => (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    if (checked) {
      if (!correctOptions.includes(index)) {
        setCorrectOptions([...correctOptions, index]);
      }
    } else {
      const newCorrectOptions = [...correctOptions];
      const optionIndex = newCorrectOptions.indexOf(index);
      newCorrectOptions.splice(optionIndex, 1);
      setCorrectOptions([...newCorrectOptions]);
    }
  };

  return (
    <div>
      <div>
        <Text level={2} strong>
          <Trans>Answer</Trans>
        </Text>
      </div>
      <Trans>
        After providing possible answers, select the correct options.
      </Trans>
      <Checkbox.Group style={{ width: "100%" }} value={correctOptions}>
        <Space direction="vertical" style={{ width: "100%" }} key={options.length}>
          {options.map((option, index) => (
            <StyledCheckbox
              key={index}
              value={index}
              onChange={onChangeCorrectOption(index)}
            >
              <Input
                defaultValue={option}
                width={"100%"}
                placeholder={t`Type your answer option`}
                onChange={onChangeValue(index)}
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                onClick={removeOption(index)}
              />
            </StyledCheckbox>
          ))}
        </Space>
      </Checkbox.Group>
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

const StyledCheckbox = styled(Checkbox)`
  width: 100%;
  display: flex;

  & span:nth-child(2) {
    flex: 1;
    display: flex;
    align-items: center;
  }
`;

export default MultipleChoiceSetting;
