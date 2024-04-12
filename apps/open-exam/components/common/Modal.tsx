import React from "react";

import { CloseOutlined } from "@ant-design/icons";
import { Modal as ModalAntd, Space } from "antd";
import styled, { useTheme } from "styled-components";

import { Text, TextWeight } from "components/common/Text";

interface ModalProps {
  bodyStyle?: React.CSSProperties;
  title?: any;
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  width?: number | string;
  padding?: string;
  centered?: boolean;
}

const ModalContainer = styled(ModalAntd)`
  display: block;
`;

const defaultPadding = "68px 48px 32px 48px";

const Modal = ({
  children,
  title,
  visible,
  onClose,
  width = 617,
  padding = defaultPadding,
  bodyStyle,
  centered,
}: ModalProps) => {
  const theme = useTheme();
  return (
    <ModalContainer
      bodyStyle={{...(bodyStyle || { padding }), ...{overflow: 'auto'}}}
      open={visible}
      footer={null}
      width={width}
      closeIcon={
        <CloseOutlined
          onClick={onClose}
          style={{ color: theme.colors.gray[8] }}
        />
      }
      destroyOnClose
      centered={centered}
    >
      <Space size={12} direction="vertical" style={{ width: "100%" }}>
        {title && (
          <Text level={4} weight={TextWeight.bold} color={theme.colors.gray[8]}>
            {title}
          </Text>
        )}
        {children}
      </Space>
    </ModalContainer>
  );
};

export default Modal;
