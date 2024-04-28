import { Trans } from "@lingui/macro";
import { Tooltip } from "antd";
import { Text, TextWeight } from "components/common/Text";
import React from "react";
import styled from "styled-components";

interface Props {
  name: string;
  icon: React.ReactNode;
  triggerBlockMenu: () => void;
  shortcut?: string;
}

export const BlockItem: React.FC<Props> = ({
  name,
  icon,
  triggerBlockMenu,
  shortcut,
}) => {
  return (
    <Tooltip
      destroyTooltipOnHide
      title={shortcut}
      placement="topRight"
      arrow={false}
    >
      <BlockItemContainer onClick={triggerBlockMenu}>
        <Text weight={TextWeight.medium} level={2}>
          <Trans>{name}</Trans>
        </Text>
        {icon}
      </BlockItemContainer>
    </Tooltip>
  );
};

const BlockItemContainer = styled.div`
  border-radius: 8px;
  border: ${({ theme }) => `1px solid ${theme.colors.gray[4]}`};
  background: ${({ theme }) => theme.colors.gray[0]};
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;
