import Tag from "components/common/Tag";
import { Text } from "components/common/Text";
import React from "react";
import styled from "styled-components";
import { QuizNumberContainer } from "./QuestionListSection";

export const enum StatusAnswer {
  DEFAULT = "default",
  WARNING = "warning",
  CORRECT = "correct",
  ANSWERED = "answered",
  WRONG = "wrong",
}

export const colorQuestion: {
  [key in StatusAnswer]: {
    backgroundColor: string;
    textColor: string;
    description?: string;
  };
} = {
  [StatusAnswer.DEFAULT]: {
    backgroundColor: "#EAECEF",
    textColor: "#888E9C",
    description: "Correct setting",
  },
  [StatusAnswer.WARNING]: {
    backgroundColor: "#fff566",
    textColor: "#888E9C",
    description: "Incorrect setting",
  },
  [StatusAnswer.CORRECT]: {
    backgroundColor: "#52C41A",
    textColor: "#FFFFFF",
    description: "Correct answer",
  },
  [StatusAnswer.WRONG]: {
    backgroundColor: "#FFF2E8",
    textColor: "#FA541C",
    description: "Wrong answer",
  },
  [StatusAnswer.ANSWERED]: {
    backgroundColor: "#1C53F4",
    textColor: "#FFFFFF",
    description: "Answered",
  },
};

export const ColorLegend: React.FC = () => {
  return (
    <LegendContainer>
      <LegendItem>
        <QuizNumberContainer
          backgroundColor={colorQuestion[StatusAnswer.DEFAULT].backgroundColor}
          textColor={colorQuestion[StatusAnswer.DEFAULT].textColor}
        >
          0
        </QuizNumberContainer>
        <Description>
          {colorQuestion[StatusAnswer.DEFAULT].description}
        </Description>
      </LegendItem>
      <LegendItem>
        <QuizNumberContainer
          backgroundColor={colorQuestion[StatusAnswer.WARNING].backgroundColor}
          textColor={colorQuestion[StatusAnswer.WARNING].textColor}
        >
          0
        </QuizNumberContainer>
        <Description>
          {colorQuestion[StatusAnswer.WARNING].description}
        </Description>
      </LegendItem>
    </LegendContainer>
  );
};

const LegendContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

const Description = styled.div`
  margin-left: 8px;
  color: ${(props) => props.theme.colors.gray[7]};
`;
