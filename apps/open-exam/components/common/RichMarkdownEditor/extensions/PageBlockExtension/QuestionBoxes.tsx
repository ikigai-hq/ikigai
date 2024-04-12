import { Tooltip } from "antd";
import { Text, TextWeight } from "components/common/Text";
import usePageBlockStore from "context/ZustandPageBlockStore";
import { GetPageBlocks_documentGet_pageBlocks } from "graphql/types";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { CircleQuestionList } from "./CircleQuestionList";
import useQuizStore from "context/ZustandQuizStore";
import { ArrowDocument } from "components/common/IconSvg";
import { BreakPoints } from "styles/mediaQuery";

interface QuestionBoxItem {
  id: string;
  pageBlockData: GetPageBlocks_documentGet_pageBlocks;
  isSelected: boolean;
  onSelect: () => void;
  title: string;
}

export const QuestionBoxes: React.FC<{
  documentId: number;
  isPresentationMode?: boolean;
}> = ({ documentId, isPresentationMode }) => {
  const pageBlocks = usePageBlockStore((state) => state.pageBlocks);
  const currentPageBlockId = usePageBlockStore(
    (state) => state.currentPageBlockId,
  );
  const mapPageBlockData = usePageBlockStore((state) => state.mapPageBlockData);
  const updateCurrentPageBlockId = usePageBlockStore(
    (state) => state.updateCurrentPageBlockId,
  );

  const [currentBoxId, setCurrentBoxId] = useState<string>("");

  useEffect(() => {
    setCurrentBoxId(currentPageBlockId);
  }, [currentPageBlockId]);

  const onSelectBox = (id: string) => {
    const question = document.getElementById(`question-box-${id}`);
    question.scrollIntoView({ behavior: "smooth" });
    setCurrentBoxId(id);
    updateCurrentPageBlockId(id);
  };

  return (
    <QuestionBoxContainer $isPresentationMode={isPresentationMode}>
      {mapPageBlockData.get(documentId)?.map((item, index) => {
        const existingPageBlock = pageBlocks.find((pb) => pb.id === item.id);
        if (!existingPageBlock) return null;
        return (
          <QuestionBoxWrapper
            key={item.id}
            $isSelected={currentBoxId === item.id}
          >
            <ArrowDocument
              style={{ opacity: index > 0 ? 1 : 0.2 }}
              onClick={() =>
                index > 0 &&
                onSelectBox(mapPageBlockData.get(documentId)[index - 1].id)
              }
            />
            <QuestionBoxItem
              id={item.id}
              pageBlockData={existingPageBlock}
              isSelected={currentBoxId === item.id}
              title={existingPageBlock?.title}
              onSelect={() => onSelectBox(item.id)}
            />
            <ArrowDocument
              style={{
                transform: `rotate(-180deg)`,
                opacity:
                  index < mapPageBlockData.get(documentId).length - 1 ? 1 : 0.2,
              }}
              onClick={() =>
                index < mapPageBlockData.get(documentId).length - 1 &&
                onSelectBox(mapPageBlockData.get(documentId)[index + 1].id)
              }
            />
          </QuestionBoxWrapper>
        );
      })}
    </QuestionBoxContainer>
  );
};

const QuestionBoxItem: React.FC<QuestionBoxItem> = ({
  id,
  pageBlockData,
  isSelected,
  onSelect,
  title,
}) => {
  const mapQuizBlockData = useQuizStore((state) => state.mapQuizBlockData);
  const totalQuizzes = pageBlockData?.nestedDocuments
    ?.map((nd) => nd.documentId)
    ?.reduce((prevValue, currValue) => {
      return prevValue + mapQuizBlockData.get(currValue)?.length;
    }, 0);

  return (
    <QuestionBoxItemContainer
      id={`question-box-${id}`}
      onClick={onSelect}
      $isSelected={isSelected}
    >
      <Tooltip arrow={false} title={title}>
        <Text
          style={{
            maxWidth: 150,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
          weight={TextWeight.mediumlv2}
        >
          {title}
        </Text>
      </Tooltip>
      {totalQuizzes > 0 &&
        (isSelected ? (
          <CircleQuestions>
            {pageBlockData?.nestedDocuments?.map((nd) => (
              <CircleQuestionList
                key={nd.documentId}
                documentId={nd.documentId}
              />
            ))}
          </CircleQuestions>
        ) : (
          <Text
            style={{ width: "max-content" }}
          >{`: Total ${totalQuizzes} question(s)`}</Text>
        ))}
    </QuestionBoxItemContainer>
  );
};

const QuestionBoxItemContainer = styled.div<{ $isSelected: boolean }>`
  border-radius: 12px;
  border: ${(props) =>
    `1px solid ${
      props.$isSelected
        ? props.theme.colors.primary[5]
        : props.theme.colors.gray[3]
    }`};
  background: ${(props) => props.theme.colors.gray[0]};
  padding: 9px 12px;
  cursor: pointer;
  margin-right: 12px;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;

  ${BreakPoints.tablet} {
    margin-right: 0;
    flex: 1;
  }
`;

const QuestionBoxContainer = styled.div<{ $isPresentationMode?: boolean }>`
  z-index: 1;
  display: flex;
  width: 100%;
  overflow: auto;
  box-sizing: border-box;
  justify-content: ${(props) =>
    props.$isPresentationMode ? "center" : "unset"};
`;

const CircleQuestions = styled.div`
  margin-left: 8px;
  display: flex;
  max-width: 200px;
  overflow: auto;

  ${BreakPoints.tablet} {
    max-width: 100%;
  }
`;

const QuestionBoxWrapper = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    display: none;
  }

  ${BreakPoints.tablet} {
    display: ${(props) => (props.$isSelected ? "flex" : "none")};
    width: 100%;

    svg {
      display: block;
      min-width: 20px;
    }
  }
`;
