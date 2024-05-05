import React, { useState } from "react";
import { Radio, Space } from "antd";

import { QuizAttrs, ViewMode } from "../type";
import SingleChoiceReview from "./SingleChoiceReview";
import QuizReport from "../QuizReport";
import useDocumentStore from "context/ZustandDocumentStore";
import useQuizStore from "context/ZustandQuizStore";
import { Metadata } from "util/BlockUtil";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";

export type SingleChoiceOption = {
  viewMode: ViewMode;
  attrs: QuizAttrs;
  documentId?: string;
  answer: (quizId: string, answer: Metadata) => Promise<void>;
};

const SingleChoice = ({
  attrs,
  documentId,
  answer,
  viewMode,
}: SingleChoiceOption) => {
  const allow = usePermission();
  const config = useDocumentStore((state) => state.documentConfig);
  const mapQuizBlockData = useQuizStore((state) => state.mapQuizBlockData);
  const quizzes = useQuizStore((state) => state.quizzes);
  const quizData = quizzes.get(attrs.quizId);
  const options = quizData?.structure?.quizBody
    ? [...quizData.structure.quizBody]
    : [];
  const quizBlockData = mapQuizBlockData.get(documentId);

  const [answerIndex, setAnswerIndex] = useState<number | null>(
    quizBlockData?.find((q) => q.id === attrs.quizId)?.metadata?.answer
      ?.indexAnswer,
  );

  const onChangeAnswer = async (index: number) => {
    if (viewMode !== ViewMode.Default) return;
    setAnswerIndex(index);
    await answer(attrs.quizId, {
      answer: { isAnswered: !!options[index], indexAnswer: index },
    });
  };

  if (viewMode === ViewMode.Report) {
    return <QuizReport quizId={attrs.quizId} />;
  }

  if (config.showQuizReview) {
    return <SingleChoiceReview attrs={attrs} documentId={documentId} />;
  }

  return (
    <div>
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <Radio.Group
          key={attrs.quizId}
          onChange={(e) => onChangeAnswer(e.target.value)}
          value={answerIndex}
          disabled={!allow(DocumentActionPermission.INTERACTIVE_WITH_TOOL)}
          name={attrs.quizId}
        >
          <Space direction="vertical">
            {options.map((option, index) => (
              <Radio key={`${option}-${index}`} value={index}>
                {option}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>
    </div>
  );
};

export default SingleChoice;
