import React, { useMemo, useState } from "react";

import { Col, Divider, Row } from "antd";
import {
  QuizType,
  GetDocumentDetail_documentGet_quizzes as IDocumentQuiz,
} from "graphql/types";
import { QuizAttrs } from "../type";
import { Text } from "components/common/Text";
import { Input, InputArea } from "components/common/Input";
import { Select } from "components/common/Select";
import { Button as StyledButton } from "../../../../Button";
import SingleChoiceSetting from "./SingleChoiceSetting";
import EmptyState from "../../../../../EmptyState";
import MultipleChoiceSetting from "./MultipleChoiceSetting";
import toast from "react-hot-toast";
import { Trans, t } from "@lingui/macro";

export type QuizSettingProps = {
  attrs: QuizAttrs;
  data: IDocumentQuiz;
  saveQuiz: (
    quizType: QuizType,
    quizTitle: string,
    quizBody: any,
    quizAnswer: any,
    quizExplanation: string,
  ) => Promise<void>;
  onClose: () => void;
};

export const QuizSetting = (props: QuizSettingProps) => {
  const { onClose, saveQuiz, data, attrs } = props;
  const [quizTitle, setQuizTitle] = useState(
    attrs.quizTitle || data?.structure?.quizTitle,
  );
  const [quizType, setQuizType] = useState(data?.structure?.quizType);
  const [quizBody, setQuizBody] = useState<any>(data?.structure?.quizBody);
  const [quizAnswer, setQuizAnswer] = useState<any>(data?.structureAnswer);
  const [explanation, setExplanation] = useState(data?.structureExplanation);
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    const singleOption = quizAnswer?.correctOption;
    const multipleChoiceOptions = quizAnswer?.correctOptions || [];
    const noChooseSingleOption =
      quizType === QuizType.SINGLE_CHOICE &&
      (singleOption === undefined || singleOption === null);
    const noChooseMultipleOptions =
      quizType === QuizType.MULTIPLE_CHOICE &&
      multipleChoiceOptions.length === 0;

    if (noChooseSingleOption || noChooseMultipleOptions) {
      toast.error(t`Please choose the correct answer and save again!`);
      return;
    }

    setLoading(true);
    await saveQuiz(quizType, quizTitle, quizBody, quizAnswer, explanation);
    setLoading(false);
    onClose();
  };

  const onChangeQuizType = (e: QuizType) => {
    setQuizType(e);
    setQuizAnswer(
      e === QuizType.SINGLE_CHOICE
        ? { correctOption: undefined }
        : { correctOptions: [] },
    );
  };

  const renderSetting = useMemo(() => {
    switch (quizType) {
      case QuizType.SINGLE_CHOICE:
        return (
          <SingleChoiceSetting
            quizBody={quizBody}
            quizAnswer={quizAnswer}
            onChangeBody={setQuizBody}
            onchangeAnswer={setQuizAnswer}
          />
        );
      case QuizType.MULTIPLE_CHOICE:
        return (
          <MultipleChoiceSetting
            quizBody={quizBody}
            quizAnswer={quizAnswer}
            onChangeBody={setQuizBody}
            onchangeAnswer={setQuizAnswer}
          />
        );
      default:
        return <EmptyState content={t`We're developing it!!`} />;
    }
  }, [quizType, data]);

  return (
    <>
      <div style={{ overflowY: "auto", height: "68vh" }}>
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <Text level={2} strong>
              <Trans>Question</Trans>
            </Text>
            <Input
              defaultValue={quizTitle}
              onChange={(e) => setQuizTitle(e.currentTarget.value)}
            />
          </Col>
          <Col span={24}>
            <Text level={2}>
              <Trans>Answer type</Trans>
            </Text>
            <Select
              defaultValue={QuizType.SINGLE_CHOICE}
              value={quizType}
              onChange={onChangeQuizType}
            >
              <Select.Option value={QuizType.SINGLE_CHOICE}>
                <Trans>Single Choice</Trans>
              </Select.Option>
              <Select.Option value={QuizType.MULTIPLE_CHOICE}>
                <Trans>Multiple Choice</Trans>
              </Select.Option>
            </Select>
          </Col>
        </Row>
        <Divider />
        {renderSetting}
        <Divider />
        <div>
          <Text level={2} strong>
            <Trans>Answer explanation</Trans>
          </Text>
          <InputArea
            value={explanation}
            onChange={(e) => setExplanation(e.currentTarget.value)}
            placeholder={t`Explain the answer`}
            rows={3}
          />
        </div>
      </div>
      <Divider />
      <StyledButton
        type="primary"
        style={{ float: "right" }}
        onClick={onSave}
        loading={loading}
        disabled={loading}
      >
        <Trans>Save</Trans>
      </StyledButton>
    </>
  );
};

export default QuizSetting;
