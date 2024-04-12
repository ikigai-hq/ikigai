import React from "react";
import { Alert, Radio, Space } from "antd";

import { t } from "@lingui/macro";
import useQuizStore from "context/ZustandQuizStore";
import { QuizAttrs } from "../type";
import useDocumentStore from "context/ZustandDocumentStore";

export type SingleChoiceReviewProps = {
  attrs: QuizAttrs;
  documentId?: string;
};

const SingleChoiceReview = ({ attrs }: SingleChoiceReviewProps) => {
  const masterDocument = useDocumentStore((state) => state.masterDocument);
  const quizzes = useQuizStore((state) => state.quizzes);

  const quizInfo = quizzes.get(attrs.quizId);
  const options = quizInfo?.structure?.quizBody ? [...quizInfo.structure.quizBody] : [];
  const reviewingSubmissionUserId = masterDocument?.submission?.user?.id;
  const answerInfo = quizInfo?.answers?.find((a) => a.userId === reviewingSubmissionUserId);
  const indexAnswer = options.indexOf(answerInfo?.answer?.answer);
  const isCorrectAnswer = answerInfo?.isCorrect;
  const explanation = quizInfo?.structureExplanation;
  const wrongMessage = `${t`Wrong! Correct answer is`} "${options[quizInfo?.structureAnswer?.correctOption || 0]}"`;

  return (
    <div>
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <Radio.Group disabled={true} value={indexAnswer}>
          <Space direction="vertical">
            {options.map((option, index) => (
              <Radio key={`${option}-${index}`} value={index}>
                {option}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>
      {isCorrectAnswer && (
        <Alert message={explanation ? `${t`Correct. Explain:`} ${explanation}` : t`Correct`} type="success" showIcon />
      )}
      {!isCorrectAnswer && (
        <Alert
          message={explanation ? `${wrongMessage}. ${t`Explain`}: ${explanation}` : wrongMessage}
          type="error"
          showIcon
        />
      )}
    </div>
  );
};

export default SingleChoiceReview;
