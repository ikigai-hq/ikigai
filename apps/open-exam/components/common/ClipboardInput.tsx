import React, { useRef, useState } from "react";

import { CopyOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import styled from "styled-components";

import { Input } from "components/ProfileSetting/styles";

const InputInvite = styled(Input)`
  padding: 10px 12px;
  font-size: 14px;
  width: 100%;

  .ant-input-suffix {
    cursor: pointer;
    svg {
      color: ${(props) => props.theme.colors.gray[6]};
    }
  }
`;

export const ClipboardInput: React.FC<{
  textValue: string;
  disabled?: boolean;
}> = ({ textValue, disabled = false }) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [clipboardInput, setClipboardInput] = useState<string>(textValue);
  const closeTooltip = useRef(null);

  const copyLink = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!clipboardInput) return;
    clearTimeout(closeTooltip.current);
    await navigator.clipboard.writeText(clipboardInput);
    setIsCopied(true);

    e.preventDefault();
    closeTooltip.current = setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <InputInvite
      disabled={disabled}
      value={clipboardInput}
      onChange={(e) => setClipboardInput(e.target.value)}
    />
  );
};
