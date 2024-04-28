import React from "react";
import styled from "styled-components";
import { useQuizzesInOrder } from "hook/UseQuizInOrder";
import { QuestionNumber } from "components/Document/RightPanel/SubmissionPanel";

export const CircleQuestionList: React.FC<{
  documentId: number;
}> = ({ documentId }) => {
  const orderingQuizzes = useQuizzesInOrder();
  const quizzesPageBlock: { masterIndex: number; quizId: string }[] = [];
  orderingQuizzes.forEach((q, index) => {
    if (q.documentId === documentId) {
      quizzesPageBlock.push({ masterIndex: index, quizId: q.quizId });
    }
  });

  const jumpToQuiz = (quizId: string) => {
    const element = document.getElementById(quizId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <CircleQuestionContainer>
      {quizzesPageBlock?.map((q) => {
        return (
          <div key={q.quizId} style={{ marginRight: 4 }}>
            <QuestionNumber
              quizId={q.quizId}
              quizNumber={q.masterIndex + 1}
              onClickQuiz={() => {
                jumpToQuiz(q.quizId);
              }}
            />
          </div>
        );
      })}
    </CircleQuestionContainer>
  );
};

const CircleQuestionContainer = styled.div`
  display: flex;
`;
