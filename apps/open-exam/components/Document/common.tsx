import styled from "styled-components";
import { Input, Statistic } from "antd";
import { BreakPoints } from "styles/mediaQuery";
import { DEFAULT_RIGHT_SIDE_WIDTH } from "../../util";

const { Countdown } = Statistic;

export const DocumentHeaderWrapper = styled.div`
  padding: 16px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  width: 100%;
  box-sizing: border-box;
`;

export const CommonContainer = styled.div<{
  $isFullScreen?: boolean;
  $downloadable?: boolean;
}>`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 2px;

  &&& {
    .ant-ribbon-wrapper {
      width: 100%;
      height: 100%;
    }

    .ant-ribbon {
      ${(props) => !props.$downloadable && `display: none`};
    }
  }

  ${(props) =>
    props.$isFullScreen &&
    `
      transition: 0.5s all;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #181e2df5;
      z-index: 99;

      &&& {
        .ant-ribbon {
          display: none;
        }
      }
    `}
`;

export const ExportDocument = styled.div<{ $isNestedDoc?: boolean }>`
  height: 100%;
  overflow: auto;
  scrollbar-gutter: stable both-edges;
`;

export const DocumentBody = styled.div<{
  $isViewInMobile?: boolean;
  $isNestedDoc?: boolean;
  $isPublishedPage?: boolean;
}>`
  overflow: auto;
  width: 100%;
  height: 100%;
  border-radius: ${(props) => (props.$isViewInMobile ? 0 : 8)}px;
  border-top: ${(props) =>
    props.$isNestedDoc ? "unset" : `1px solid ${props.theme.colors.gray[3]}`};
  background: #ffff;
  border: ${(props) =>
    props.$isNestedDoc ? "none" : "1px solid var(--gray-4,#EAECEF)"};
  box-sizing: border-box;

  ${BreakPoints.tablet} {
    margin: 0;
    max-height: 100%;
    height: 100%;
    border: none;
  }
`;

export const StyledTitle = styled(Input.TextArea)<{ $fontSize?: number }>`
  &&& {
    font-size: ${(props) => props.$fontSize || 40}px;
    font-weight: 700;
    padding-left: 0;
    overflow: hidden;
    line-height: normal;

    &:focus {
      outline: none !important;
      box-shadow: none !important;
      border-color: transparent !important;
    }

    ${BreakPoints.tablet} {
      font-size: ${(props) => props.$fontSize || 32}px;
    }
  }
`;

export const StyledLeftMenu = styled.div`
  display: flex;
`;

export const StyledRightMenu = styled.div`
  display: flex;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #fcfaf4;
`;

export const DocumentBodyContainer = styled.div<{
  $isPresentationMode?: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
  flex-grow: 1;
  margin-bottom: ${(props) => (props.$isPresentationMode ? 0 : "10px")};

  ${BreakPoints.tablet} {
    margin-bottom: 0;
  }
`;

export const BodyWrapper = styled.div`
  display: flex;
  flex: 1;
  max-width: 100vw;
  width: 100%;
  height: 100%;
  padding: 0 16px;
  box-sizing: border-box;
  gap: 8px;

  ${BreakPoints.tablet} {
    flex-direction: column-reverse;
    gap: 12px;
    height: 100%;
    justify-content: flex-end;
    padding: 0;
  }
`;

export const RightBodyContainer = styled.div<{
  $hide: boolean;
  $leftPanel?: boolean;
}>`
  min-width: ${DEFAULT_RIGHT_SIDE_WIDTH}px;
  width: ${DEFAULT_RIGHT_SIDE_WIDTH}px;
  display: ${({ $hide }) => ($hide ? "none" : "flex")};
  border-radius: 8px;
  backdrop-filter: blur(12px);
  border: ${({ $hide }) =>
    $hide ? "none" : "1px solid var(--gray-4, #EAECEF)"};
  background: rgba(255, 255, 255, 0.75);
  box-sizing: border-box;
  height: 100%;

  ${BreakPoints.tablet} {
    display: ${({ $leftPanel }) => ($leftPanel ? "none" : "block")};
    box-shadow: 0px 0px 20px rgba(19, 48, 122, 0.1);
    width: 100%;
    height: auto;
  }
`;

export const DividerDocument = styled.div`
  background: ${(props) => props.theme.colors.gray[3]};
  margin: 0 auto;
  width: calc(100% - 96px);
  height: 1px;

  ${BreakPoints.tablet} {
    background: ${(props) => props.theme.colors.gray[11]};
    height: 1px;
    margin: 16px -20px;
    width: calc(100% + 20px);
  }
`;

export const DocumentTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  ${BreakPoints.tablet} {
    gap: 8px;
  }
`;

export const CountdownMobile = styled(Countdown)`
  .ant-statistic-content {
    display: flex;

    .ant-statistic-content-value {
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      color: ${(props) => props.theme.colors.blue[5]};
    }
  }
`;

export const DocumentHeaderTitle = styled.div`
  width: 100%;
  text-align: center;
  display: none;

  ${BreakPoints.tablet} {
    display: block;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: initial;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
  }
`;

export const EDITOR_ID = "active-editor";

export const DEFAULT_DOCUMENT_TITLE = "Untitled";
