import React, { useState } from "react";
import { Checkbox, Space } from "antd";

import { QuizAttrs, ViewMode } from "../type";
import MultipleChoiceReview from "./MultipleChoiceReview";
import QuizReport from "../QuizReport";
import useDocumentStore from "context/ZustandDocumentStore";
import useQuizStore from "context/ZustandQuizStore";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";

export type MultipleChoiceOption = {
  viewMode: ViewMode;
  attrs: QuizAttrs;
  answer: (quizId: string, answer: any) => Promise<void>;
  documentId?: string;
};

const MultipleChoice: React.FC<MultipleChoiceOption> = ({
  viewMode,
  attrs,
  answer,
  documentId,
}) => {
  const allow = usePermission();
  const config = useDocumentStore((state) => state.documentConfig);
  const quizzes = useQuizStore((state) => state.quizzes);
  const mapQuizBlockData = useQuizStore((state) => state.mapQuizBlockData);
  const quizData = quizzes.get(attrs.quizId);

  const options: string[] = quizData?.structure?.quizBody
    ? [...quizData.structure.quizBody]
    : [];
  const quizBlockData = mapQuizBlockData
    .get(documentId)
    ?.find((q) => q.id === attrs.quizId);
  const multipleIndexAnswer =
    quizBlockData?.metadata?.answer?.multipleIndexAnswer;
  const initialAnswerIndex = multipleIndexAnswer
    ? [...multipleIndexAnswer]
    : [];

  const [answerIndex, setAnswerIndex] = useState<number[]>(initialAnswerIndex);

  const onChangeAnswer = async (userAnswer: number[]) => {
    setAnswerIndex(userAnswer);
    await answer(attrs.quizId, {
      answer: {
        isAnswered: !!userAnswer.length,
        multipleIndexAnswer: userAnswer,
      },
    });
  };

  if (viewMode === ViewMode.Report) {
    return <QuizReport quizId={attrs.quizId} />;
  }

  if (config.showQuizReview) {
    return <MultipleChoiceReview documentId={documentId} attrs={attrs} />;
  }

  return (
    <div>
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <Checkbox.Group
          onChange={(values) => onChangeAnswer(values as number[])}
          value={answerIndex}
          disabled={!allow(DocumentActionPermission.INTERACTIVE_WITH_TOOL)}
        >
          <Space direction="vertical">
            {options.map((option, index) => (
              <Checkbox key={`${option}-${index}`} value={index}>
                {option}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </div>
    </div>
  );
};

export default MultipleChoice;
