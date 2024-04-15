import styled, { useTheme } from "styled-components";
import { BreakPoints } from "styles/mediaQuery";
import React from "react";
import { Space, Tooltip } from "antd";
import { Text, TextWeight } from "components/common/Text";
import { DrawerDocument } from "components/common/IconSvg";

const DEFAULT_INDENT = 8;

export const LeftPanelWrapper = styled.div<{ $actived: boolean }>`
  border-radius: 8px;
  border: 1px solid var(--gray-4, #eaecef);
  background: rgba(255, 255, 255, 1);
  backdrop-filter: blur(12px);
  width: 300px;
  height: calc(100% - 2px);
  overflow: hidden;
  position: relative;
  transition: 0.3s all;
  z-index: 99;
  left: ${(props) => (props.$actived ? "300px" : "0px")};
  box-shadow: ${(props) =>
    props.$actived ? "0px 0px 4px 0px rgba(0, 0, 0, 0.08)" : "none"};
  display: flex;
  flex-direction: column;

  ${BreakPoints.tablet} {
    display: none;
  }
`;

export const ListModule = styled.div`
  padding: 10px 20px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ClassInformation = styled.div`
  padding: 24px 20px;
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  gap: 12px;

  &::after {
    content: "";
    position: absolute;
    height: 1px;
    width: calc(100% - 40px);
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    background: ${(props) => props.theme.colors.gray[3]};
  }

  svg {
    cursor: pointer;
  }
`;

export const ClassTitle = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DocumentIcon = styled.img`
  width: 57px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 4px;
  object-fit: cover;
`;

export const TitlePanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  height: 45px;
  padding: 20px 20px 10px 20px;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ContentItem = styled.div<{ $active?: boolean; $level: number }>`
  padding: 4px;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  > span {
    white-space: nowrap;
    padding-left: ${({ $level }) => {
      if ($level === 1) return 0;
      return $level * DEFAULT_INDENT;
    }}px;
  }
  &:hover {
    background: ${(props) => props.theme.colors.gray[1]};
  }
`;

export const SpaceInfo: React.FC<{
  title: string;
  setActive?: (value: boolean) => void;
  imgUrl?: string;
  isDoc?: boolean;
}> = ({ title, setActive, imgUrl, isDoc = false }) => {
  const theme = useTheme();
  return (
    <ClassInformation>
      <Space size={12}>
        {isDoc ? (
          <DocumentIcon alt="doc-thumbnail" src="/doc-thumbnail.png" />
        ) : (
          <DocumentIcon
            alt="doc-thumbnail"
            src={imgUrl || "/course-image.png"}
          />
        )}
        <Space direction="vertical" size={2}>
          <ClassTitle>
            <Text
              level={3}
              weight={TextWeight.bold}
              color={theme.colors.gray[9]}
            >
              {title}
            </Text>
          </ClassTitle>
        </Space>
      </Space>
      {setActive && (
        <Tooltip
          placement="bottom"
          title={
            <Text
              level={2}
              color={theme.colors.gray[0]}
            >{`Click to view class content`}</Text>
          }
        >
          <div style={{ height: 24 }} onClick={() => setActive(true)}>
            <DrawerDocument />
          </div>
        </Tooltip>
      )}
    </ClassInformation>
  );
};
