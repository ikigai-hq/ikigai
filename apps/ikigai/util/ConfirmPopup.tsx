import { CloseOutlined } from "@ant-design/icons";
import { Modal, Space } from "antd";
import styled from "styled-components";

import { Text, TextWeight } from "components/common/Text";

interface ConfirmPopupProps {
  title: string;
  content: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

const CloseButton = styled.div`
  cursor: pointer;
  text-align: right;
  width: 100%;
  margin-bottom: 12px;
`;

const ContentContainer = styled(Space)`
  padding: 0px 24px;
`;

export const ConfirmPopup = ({
  title,
  content,
  onOk,
  onCancel,
  okText = "Confirm",
  cancelText = "Cancel",
  danger = false,
}: ConfirmPopupProps) => {
  return {
    title: (
      <CloseButton>
        <CloseOutlined onClick={() => Modal.destroyAll()} />
      </CloseButton>
    ),
    content: (
      <ContentContainer size={2} direction="vertical">
        <Text level={3} weight={TextWeight.bold} color="gray9">
          {title}
        </Text>
        <Text level={2} color="gray9">
          {content}
        </Text>
      </ContentContainer>
    ),
    okText,
    cancelText,
    className: "custom-confirm-popup",
    onOk,
    onCancel,
    icon: null,
    autoFocusButton: null,
    okButtonProps: {
      danger,
    },
    okType: danger ? "default" : "primary",
  };
};
