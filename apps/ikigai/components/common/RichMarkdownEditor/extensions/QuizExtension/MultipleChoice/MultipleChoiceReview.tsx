import React from "react";
import { Alert, Checkbox, Space } from "antd";

import { t } from "@lingui/macro";
import useQuizStore from "context/ZustandQuizStore";
import { QuizAttrs } from "../type";
import useDocumentStore from "context/ZustandDocumentStore";

export type MultipleChoiceReviewProps = {
  attrs: QuizAttrs;
  documentId?: string;
};

const MultipleChoiceReview: React.FC<MultipleChoiceReviewProps> = ({
  attrs,
  documentId,
}) => {
  const masterDocument = useDocumentStore((state) => state.masterDocument);
  const quizzes = useQuizStore((state) => state.quizzes);

  const quizInfo = quizzes.get(attrs.quizId);
  const options = quizInfo?.structure?.quizBody
    ? [...quizInfo.structure.quizBody]
    : [];
  const reviewingSubmissionUserId = masterDocument?.submission?.user?.id;
  const answerInfo = quizInfo?.answers?.find(
    (a) => a.userId === reviewingSubmissionUserId,
  );
  const isCorrectAnswer = answerInfo?.isCorrect;
  const expectedAnswers: number[] =
    quizInfo?.structureAnswer?.correctOptions || [];
  const userAnswers = answerInfo?.answer?.answer;
  const explanation = quizInfo?.structureExplanation;
  const wrongMessage = `Wrong! Correct answer is "${expectedAnswers
    .map((expectedAnswer) => `'${options[expectedAnswer]}'`)
    .join(", ")}"`;

  return (
    <div>
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <Checkbox.Group disabled={true} value={userAnswers}>
          <Space direction="vertical">
            {options.map((option, index) => (
              <Checkbox key={`${option}-${index}`} value={index}>
                {option}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </div>
      {isCorrectAnswer && (
        <Alert
          message={
            explanation ? `${t`Correct. Explain`}: ${explanation}` : t`Correct.`
          }
          type="success"
          showIcon
        />
      )}
      {!isCorrectAnswer && (
        <Alert
          message={
            explanation
              ? `${wrongMessage}. ${`Explain`}: ${explanation}`
              : wrongMessage
          }
          type="error"
          showIcon
        />
      )}
    </div>
  );
};

export default MultipleChoiceReview;
