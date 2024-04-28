import { Input, Tooltip } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

import styled from "styled-components";
import { t } from "@lingui/macro";
import useQuizStore from "context/ZustandQuizStore";
import useDocumentStore from "context/ZustandDocumentStore";
import { InputFillInBlank } from "./FillInBlankBlock";

export type FillBlankReviewProps = {
  quizId: string;
  documentId?: number;
};

const FillInBlankReview = ({ quizId }: FillBlankReviewProps) => {
  const masterDocument = useDocumentStore((state) => state.masterDocument);
  const quizzes = useQuizStore((state) => state.quizzes);

  const quizInfo = quizzes.get(quizId);
  const reviewingSubmissionUserId = masterDocument?.submission?.user?.id;
  const answerInfo = quizInfo?.answers?.find(
    (a) => a.userId === reviewingSubmissionUserId,
  );

  const answer = answerInfo?.answer?.answer || "";
  const explanation = quizInfo?.structureExplanation;
  const expectedAnswers: string[] = quizInfo?.structureAnswer?.correctOptions
    ? quizInfo.structureAnswer.correctOptions
    : [];
  const isCorrect = answerInfo?.isCorrect;

  return (
    <CustomizeTooltip
      title={`${t`Correct answer is`} ${expectedAnswers
        .map((answer) => `'${answer}'`)
        .join(", ")}. ${t`Explain`}: ${explanation}`}
      color={"geekblue"}
    >
      <InputFillInBlank
        $hasValue={!!answer}
        suppressContentEditableWarning={true}
      >
        {answer.replace(/(?:\r\n|\r|\n)/g, " ")}
      </InputFillInBlank>
      {isCorrect ? (
        <CheckCircleOutlined style={{ color: "#52C41A" }} />
      ) : (
        <CloseCircleOutlined style={{ color: "#FA541C" }} />
      )}
    </CustomizeTooltip>
  );
};

const CustomizeTooltip = styled(Tooltip)`
  & .tooltip-arrow {
    display: none !important;
  }
`;

export default FillInBlankReview;
