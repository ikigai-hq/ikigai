import styled from "styled-components";
import React, { useState } from "react";
import GradeSection from "./GradeSection";
import { QuestionPanelContainer } from "./common";
import { BreakPoints } from "../../../styles/mediaQuery";
import useDocumentStore from "context/ZustandDocumentStore";
import RubricSection from "./RubricSection";
import SummarySection from "./SummarySection";
import useFillAnswer from "hook/UseFillAnswer";
import QuestionListPanel from "./QuestionListSection";

const SubmissionPanel = () => {
  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const documentConfig = useDocumentStore((state) => state.documentConfig);
  const [rubricFinalScore, setRubricFinalScore] = useState(
    activeDocument?.submission?.finalGrade || 0,
  );
  if (!activeDocument || !activeDocument.submission) return null;
  const rubricGrade = activeDocument.submission.rubricGrade;
  return (
    <QuestionPanelContainer>
      <QuestionListPanel />
      {documentConfig.showGradeSummary && <SummarySection />}
      {rubricGrade && (
        <RubricSection
          rubric={rubricGrade}
          onChangeFinalScore={setRubricFinalScore}
        />
      )}
      {documentConfig.showGradeSummary && (
        <GradeSection rubricFinalScore={rubricFinalScore} />
      )}
    </QuestionPanelContainer>
  );
};

type QuestionNumberProps = {
  quizId: string;
  quizNumber: number;
  onClickQuiz: () => void;
};

export const QuestionNumber = ({
  quizId,
  quizNumber,
  onClickQuiz,
}: QuestionNumberProps) => {
  const { backgroundColor, textColor } = useFillAnswer(quizId);
  return (
    <QuizNumberContainer
      backgroundColor={backgroundColor}
      textColor={textColor}
      onClick={onClickQuiz}
    >
      {quizNumber}
    </QuizNumberContainer>
  );
};

const QuizNumberContainer = styled.div<{
  backgroundColor: string;
  textColor: string;
}>`
  width: 28px;
  height: 28px;
  background: ${(props) => props.backgroundColor};
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.textColor};
  cursor: pointer;

  ${BreakPoints.tablet} {
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;

    &:last-child {
      margin-right: 20px;
    }
  }
`;

export const ListQuestion = styled.div`
  display: grid;
  gap: 14px 8px;
  grid-template-columns: repeat(6, 1fr);

  ${BreakPoints.tablet} {
    display: flex;
    width: max-content;
    gap: 8px;
  }
`;

export default SubmissionPanel;
