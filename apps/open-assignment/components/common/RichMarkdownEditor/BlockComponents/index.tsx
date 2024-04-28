import styled from "styled-components";
import { Divider, Input } from "antd";
import { Dropdown, MenuProps, Modal } from "antd";
import { ConfirmPopup } from "util/ConfirmPopup";
import React, { CSSProperties, ReactNode } from "react";
import { Trans, t } from "@lingui/macro";
import { Text } from "components/common/Text";
import { CopyOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTheme } from "styled-components";
import { BlockHeaderContainer, DropdownItemContainer } from "./styles";

interface Props {
  children: ReactNode;
}

export const BlockHeaderWrapper: React.FC<Props> = ({ children }) => {
  return (
    <>
      <BlockHeaderContainer>{children}</BlockHeaderContainer>
      <Divider style={{ margin: "2px 0" }} />
    </>
  );
};

export const QuizTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

export const InputWrapper = styled(Input.TextArea)<{ fitContent?: boolean }>`
  flex: ${(props) => (props.fitContent ? undefined : 1)};
  resize: none !important;
  font-size: 14px;
  font-weight: 400;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  color: #272f3e;
  outline: none;
  min-height: 22px;
  display: inline-flex;
  /* padding: 16px 8px 0; */

  :disabled {
    color: #272f3e;
    cursor: auto;
  }
`;

export type BlockTitleProps = {
  title?: string;
  defaultTitle: string;
  fitContent?: boolean;
  onChangeTitle?: (title: string) => void;
  readonly: boolean;
  style?: CSSProperties | undefined;
  onClick?: () => void;
  isSetValue?: boolean;
};

export const BlockTitle = ({
  title,
  defaultTitle,
  onChangeTitle,
  readonly,
  onClick,
  fitContent,
  isSetValue = true,
  ...props
}: BlockTitleProps) => {
  const onChangeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (onChangeTitle) onChangeTitle(value);
  };

  return (
    <InputWrapper
      autoSize
      {...props}
      fitContent={fitContent}
      onClick={() => onClick && onClick()}
      bordered={false}
      disabled={readonly}
      onChange={onChangeInput}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          return false;
        }
      }}
      defaultValue={defaultTitle}
      value={isSetValue ? title : undefined}
    />
  );
};

export const BlockTitleMemo = React.memo(BlockTitle, (pre, next) => {
  return pre.readonly === next.readonly && pre.title === next.title;
});

export type BlockDropdownMenuProps = {
  deleteTitle?: string;
  extendOptions?: MenuProps["items"];
  handleDelete: () => void;
  handleSelect: () => void;
  children?: React.ReactNode;
};

export const BlockDropdownMenu: React.FC<BlockDropdownMenuProps> = ({
  handleSelect,
  handleDelete,
  children,
  deleteTitle,
  extendOptions,
}) => {
  const [modal, contextHolder] = Modal.useModal();
  const theme = useTheme();

  const onDelete = () => {
    modal.confirm(
      ConfirmPopup({
        title: deleteTitle || t`Do you want to delete this block?`,
        onOk: handleDelete,
        content: "",
      }) as any,
    );
  };

  const items: MenuProps["items"] = [
    ...(extendOptions || []),
    {
      key: "1",
      onClick: handleSelect,
      label: (
        <DropdownItemContainer size={6}>
          <CopyOutlined />
          <Text level={1} strong>
            <Trans>Select and Copy</Trans>
          </Text>
        </DropdownItemContainer>
      ),
    },
    {
      key: "3",
      onClick: onDelete,
      label: (
        <DropdownItemContainer size={6}>
          <DeleteOutlined style={{ color: theme.colors.red[5] }} />
          <Text level={1} color={theme.colors.red[5]} strong>
            <Trans>Delete</Trans>
          </Text>
        </DropdownItemContainer>
      ),
    },
  ];

  return (
    <>
      <Dropdown
        placement="bottomRight"
        trigger={["click"]}
        menu={{ items }}
        overlayStyle={{ width: "200px" }}
      >
        {children}
      </Dropdown>
      {contextHolder}
    </>
  );
};
