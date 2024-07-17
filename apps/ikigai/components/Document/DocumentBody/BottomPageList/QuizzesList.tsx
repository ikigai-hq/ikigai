import styled from "styled-components";
import { Text } from "@radix-ui/themes";

import { IQuiz, IQuizAnswer } from "store/QuizStore";
import { getQuizAnswerColor } from "util/DocumentUtil";
import useDocumentStore from "store/DocumentStore";

type QuizzesListProps = {
  orderedQuizzes: BottomQuizItemProps[];
  hasEditTool: boolean;
};

const QuizzesList = ({ orderedQuizzes, hasEditTool }: QuizzesListProps) => {
  return (
    <div style={{ flex: 1 }}>
      <QuizzesListWrapper $hasEditTool={hasEditTool}>
        {orderedQuizzes.map((props) => (
          <BottomQuizItem key={props.quiz.id} {...props} />
        ))}
      </QuizzesListWrapper>
    </div>
  );
};

export type BottomQuizItemProps = {
  quiz: IQuiz;
  index: number;
  answer?: IQuizAnswer;
};

const BottomQuizItem = ({ quiz, index, answer }: BottomQuizItemProps) => {
  const isSubmission = useDocumentStore(
    (state) => !!state.activeDocument?.submission,
  );
  const onClick = () => {
    const e = document.getElementById(quiz.id);
    if (e) {
      e.scrollIntoView({ behavior: "smooth" });
    }
  };

  const color = isSubmission ? getQuizAnswerColor(answer) : "indigo";
  return (
    <QuizItem
      key={quiz.id}
      onClick={onClick}
      style={{
        background: `var(--${color}-8)`,
      }}
    >
      <InnerQuizWrapper>
        <Text size="1" weight="medium">
          {index + 1}
        </Text>
      </InnerQuizWrapper>
    </QuizItem>
  );
};

const QuizItem = styled.div`
  cursor: pointer;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  background: var(--indigo-2);
`;

const InnerQuizWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const QuizzesListWrapper = styled.div<{ $hasEditTool: boolean }>`
  gap: 4px;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  width: ${(props) => (props.$hasEditTool ? 290 : 350)}px;
`;

export default QuizzesList;
