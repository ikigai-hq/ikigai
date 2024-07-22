import styled from "styled-components";
import { Avatar, Text } from "@radix-ui/themes";
import React from "react";

export type SpaceListItemProps = {
  onClick: () => void;
  spaceId: number;
  spaceName: string;
  isActive?: boolean;
};

const SpaceListItem = ({
  onClick,
  spaceName,
  isActive,
}: SpaceListItemProps) => {
  return (
    <ItemContainer
      onClick={onClick}
      $active={isActive}
      style={{ justifyContent: "start" }}
    >
      <Avatar fallback={spaceName.charAt(0)} size="1" />
      <Text size="2" truncate weight="medium">
        {spaceName}
      </Text>
    </ItemContainer>
  );
};

const ItemContainer = styled.div<{ $active?: boolean }>`
  height: 28px;
  cursor: pointer;
  border-radius: 8px;
  padding: 2px 10px 2px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-weight: 450;
  background: ${(props) => (props.$active ? "#8EC8F6" : "unset")};
`;

export default SpaceListItem;
