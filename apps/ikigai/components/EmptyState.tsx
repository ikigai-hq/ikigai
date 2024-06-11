import Image from "next/image";
import styled from "styled-components";
import { ReactNode } from "react";
import { t } from "@lingui/macro";
import { Text } from "@radix-ui/themes";

const EmptyContainer = styled.div<{ hasMinHeight: boolean }>`
  min-height: ${(props) => (props.hasMinHeight ? "calc(100vh - 274px)" : 0)};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 20px;
  flex-direction: column;
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
  return (
    <EmptyContainer hasMinHeight={hasMinHeight}>
      <Image
        alt="empty"
        src="/course/empty-state.png"
        width="284"
        height="214"
      />
      {content && (
        <Text weight="light" color="gray">
          {content}
        </Text>
      )}
      <StyledChildren>{children}</StyledChildren>
    </EmptyContainer>
  );
};

export default EmptyState;
