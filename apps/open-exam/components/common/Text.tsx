import { Typography } from "antd";
import styled from "styled-components";
import { BreakPoints } from "styles/mediaQuery";

export enum TextWeight {
  regular = 400,
  medium = 500,
  mediumlv2 = 600,
  bold = 700,
}

type TitleProps = {
  level?: number;
  mLevel?: number;
  weight?: TextWeight;
  mWeight?: TextWeight;
  color?: string;
};

type TitleLevel = {
  fontSize: number;
  lineHeight: number;
};

const mappingLevel: { [key: number]: TitleLevel } = {
  0: {
    fontSize: 10,
    lineHeight: 20,
  },
  1: {
    fontSize: 12,
    lineHeight: 20,
  },
  2: {
    fontSize: 14,
    lineHeight: 22,
  },
  3: {
    fontSize: 16,
    lineHeight: 24,
  },
  4: {
    fontSize: 20,
    lineHeight: 28,
  },
  5: {
    fontSize: 24,
    lineHeight: 32,
  },
  6: {
    fontSize: 30,
    lineHeight: 38,
  },
  7: {
    fontSize: 38,
    lineHeight: 46,
  },
};

const { Text: AntdText } = Typography;

export const Text = styled(AntdText) <TitleProps>`
  white-space: pre-line;
  font-size: ${({ level = 2 }: TitleProps) =>
    `${mappingLevel[level].fontSize}px`};
  line-height: ${({ level = 2 }: TitleProps) =>
    `${mappingLevel[level].lineHeight}px`};
  font-weight: ${({ weight = TextWeight.regular }: TitleProps) => `${weight}`};
  color: ${(props) => {
    if (!props.color) return props.theme.colors.gray[8];
    if (props.color.includes('#')) return props.color;
    return props.theme.colors[props.color];
  }};
  font-family: "Inter", sans-serif;

  ${({ mLevel }) =>
    mLevel &&
    `
      ${BreakPoints.mobile} {
        font-size: ${mappingLevel[mLevel].fontSize}px;
        line-height: ${mappingLevel[mLevel].lineHeight}px;
      }
    `}

  ${({ mWeight }) =>
    mWeight &&
    `
      ${BreakPoints.mobile} {
        font-weight: ${mWeight}
      }
  `}
`;
