import { Space } from "antd";
import React, { ReactNode } from "react";
import styled, { useTheme } from "styled-components";
import { TextWeight, Text } from "./Text";
import { Trans } from "@lingui/macro";

const ButtonText = styled(Text)`
  cursor: pointer;
  color: ${(props) => props.theme.colors.blue[5]};
  font-weight: ${TextWeight.medium};
`;

interface Props {
  icon: React.ReactElement;
  isDisabled: boolean;
  onClick: () => void;
  name: string | ReactNode;
  buttonName?: string | ReactNode;
}

const PanelDetail: React.FC<Props> = ({
  icon,
  isDisabled,
  onClick,
  name,
  buttonName,
}) => {
  const theme = useTheme();
  return (
    <Space size={14} align="center">
      {icon}
      <Space direction="vertical" size={0}>
        <Text
          color={theme.colors.gray[8]}
          level={2}
          weight={TextWeight.medium}
          strong
        >
          {name}
        </Text>
        <ButtonText disabled={isDisabled} onClick={onClick} level={2}>
          {buttonName || <Trans>View</Trans>}
        </ButtonText>
      </Space>
    </Space>
  );
};

export default PanelDetail;
