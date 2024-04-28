import styled from "styled-components";
import { BreakPoints } from "./mediaQuery";

export const HeaderSetting = styled.div`
  display: inline-flex;
  width: 100%;
`;

// Responsive
export const DesktopOnly = styled.div`
  height: 100%;
  display: flex;

  ${BreakPoints.tablet} {
    display: none;
  }
`;

export const MobileOnly = styled.div`
  display: none;

  ${BreakPoints.tablet} {
    display: flex;
  }
`;
