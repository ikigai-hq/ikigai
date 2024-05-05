import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { Trans } from "@lingui/macro";
import { Section } from "./common";
import useQuizStore from "context/ZustandQuizStore";
import { BreakPoints } from "../../../styles/mediaQuery";
import useDocumentStore from "context/ZustandDocumentStore";
import { Text } from "components/common/Text";
import usePageBlockStore from "context/ZustandPageBlockStore";
import { BlockData } from "util/BlockUtil";
import { useQuizzesInOrder } from "hook/UseQuizInOrder";
import useFillAnswer from "hook/UseFillAnswer";
import { DocumentType, getDocumentType } from "../../../util/DocumentHelper";
import { ColorLegend } from "./ColorLegend";

const QuestionListPanel: React.FC = () => {
  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const documentConfig = useDocumentStore((state) => state.documentConfig);
  const orderedPageBlocks = usePageBlockStore((state) =>
    state.mapPageBlockData.get(activeDocument.id),
  );
  const pageBlocks = usePageBlockStore((state) =>
    orderedPageBlocks?.map(
      (item) => state.pageBlocks.filter((pb) => pb.id === item.id)[0],
    ),
  );
  const currentPageBlockId = usePageBlockStore(
    (state) => state.currentPageBlockId,
  );
  const updateCurrentPageBlockId = usePageBlockStore(
    (state) => state.updateCurrentPageBlockId,
  );
  const updatePageBlockMode = usePageBlockStore(
    (state) => state.updatePageBlockMode,
  );
  const pageBlockMode = usePageBlockStore((state) => state.pageBlockMode);
  const quizzes = useQuizStore((state) => {
    if (!pageBlocks?.length)
      return state.mapQuizBlockData.get(activeDocument.id);
    const quizzes: BlockData[] = [];
    pageBlocks.forEach((pb) => {
      pb?.nestedDocuments?.forEach((d) => {
        const quizBlockData = state.mapQuizBlockData.get(d.document.id);
        if (quizBlockData) {
          quizzes.push(...quizBlockData);
        }
      });
    });
    return quizzes;
  });
  const orderingQuizzes = useQuizzesInOrder();
  const [chosenQuiz, setChosenQuiz] = useState<string>("");
  const activeDocumentType = getDocumentType(activeDocument);

  useEffect(() => {
    setTimeout(() => {
      scrollToQuiz(chosenQuiz);
      setChosenQuiz("");
    }, 100);
  }, [currentPageBlockId]);

  const scrollToQuiz = (quizId: string) => {
    const element = document.getElementById(quizId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  if (
    !activeDocument ||
    (activeDocumentType === DocumentType.Submission &&
      !activeDocument.submission)
  )
    return null;

  return (
    <div>
      {(documentConfig.showQuestionList ||
        documentConfig.showQuizSettingReview) &&
        quizzes?.length > 0 && (
          <Section>
            {documentConfig.showQuestionList && (
              <Text type="secondary" color={"#888E9C"}>
                <Trans>ALL QUESTIONS</Trans>
              </Text>
            )}
            {documentConfig.showQuizSettingReview && <ColorLegend />}
            <ListQuestion>
              {orderingQuizzes.map((o, index) => (
                <QuestionNumber
                  key={o.quizId}
                  quizNumber={index + 1}
                  quizId={o.quizId}
                  onClickQuiz={() => {
                    setChosenQuiz(o.quizId);
                    if (
                      pageBlockMode &&
                      o.pageBlockId &&
                      o.pageBlockId !== currentPageBlockId
                    ) {
                      return updateCurrentPageBlockId(o.pageBlockId);
                    }
                    if (pageBlockMode && o.pageBlockId === currentPageBlockId) {
                      return scrollToQuiz(o.quizId);
                    }
                    if (!pageBlockMode && o.pageBlockId) {
                      updatePageBlockMode(true);
                      updateCurrentPageBlockId(o.pageBlockId);
                      scrollToQuiz(o.quizId);
                      return;
                    }
                    updateCurrentPageBlockId("");
                    updatePageBlockMode(false);
                    scrollToQuiz(o.quizId);
                  }}
                />
              ))}
            </ListQuestion>
          </Section>
        )}
    </div>
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

export const QuizNumberContainer = styled.div<{
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

export default QuestionListPanel;
