import { Space } from "antd";
import Image from "next/image";
import styled, { useTheme } from "styled-components";
import { Text } from "./common/Text";
import { ReactNode } from "react";
import { t } from "@lingui/macro";

const EmptyContainer = styled.div<{ hasMinHeight: boolean }>`
  min-height: ${(props) => (props.hasMinHeight ? "calc(100vh - 274px)" : 0)};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 20px;
`;

const ContentSpace = styled(Space)`
  max-width: 300px;
  margin: auto;
  text-align: center;
`;

const StyledChildren = styled.div`
  margin: 0 auto;
`;

interface Props {
  content?: string | ReactNode;
  hasMinHeight?: boolean;
  children?: ReactNode;
}

const DEFAULT_CONTENT = t`You have no class here`;

const EmptyState = ({
  content = DEFAULT_CONTENT,
  hasMinHeight = true,
  children,
}: Props) => {
  const theme = useTheme();
  return (
    <EmptyContainer hasMinHeight={hasMinHeight}>
      <Space size={54} direction="vertical">
        <Image
          alt="empty"
          src="/course/empty-state.png"
          width="284"
          height="214"
        />
        {content && (
          <ContentSpace size={20} direction="vertical">
            <Text level={3} weight={400} color={theme.colors.gray[7]}>
              {content}
            </Text>
          </ContentSpace>
        )}
        <StyledChildren>{children}</StyledChildren>
      </Space>
    </EmptyContainer>
  );
};

export default EmptyState;
