import styled from "styled-components";
import { BreakPoints } from "../../../styles/mediaQuery";
import { Typography } from "antd";

export const Section = styled.div`
  span {
    display: block;
    margin-bottom: 10px;
  }

  ${BreakPoints.tablet} {
    span {
      display: none;
      margin-bottom: 0px;
    }
  }
`;

export const QuestionPanelContainer = styled.div`
  padding: 24px;
  width: 100%;
  overflow: auto;

  ${BreakPoints.tablet} {
    padding: 12px 16px;
    width: unset;
  }
`;

export const PanelTitle = styled(Typography.Text)`
  color: var(--gray-gray-7, #888e9c);
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 169.231% */
  text-transform: uppercase;
`;
