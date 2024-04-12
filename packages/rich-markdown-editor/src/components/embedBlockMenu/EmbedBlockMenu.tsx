import React, { ChangeEvent, useState } from "react";

import styled from "styled-components";
import { EditorView } from "prosemirror-view";

import { Input as InputAntd, Button as ButtonAntd } from "antd";

export interface EmbedBlockProps {
  triggerEmbedBlock: (value: string) => void;
  view: EditorView;
}

export const EmbedBlockMenu: React.FC<EmbedBlockProps> = ({
  triggerEmbedBlock,
}) => {
  const [value, setValue] = useState("");

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleTriggerEmbedBlock = () => {
    triggerEmbedBlock(value);
  };

  return (
    <>
      <StyledEmbedInput
        value={value}
        padding="12px"
        placeholder="Paste the URL here"
        onChange={handleValueChange}
      />
      <StyledButton
        disabled={!value.length}
        onClick={handleTriggerEmbedBlock}
        type="primary"
        width="100%"
      >
        Embed
      </StyledButton>
    </>
  );
};

const StyledInput = styled(InputAntd)`
  border: 1px solid
    ${(props) =>
      props.value ? "var(--neutral-gray-5)" : "var(--neutral-gray-3)"};
  border-radius: 4px;
  box-shadow: none;
  font-weight: 400;
  font-size: 16px;
  padding: ${(props) => props.padding || "14px 12px"};
  /* padding: 14px 12px; */
  width: 100%;
  outline: none;
  color: ${({ color = "var(--neutral-gray-9)" }: inputProps) => color};
  background: ${(props) =>
    props.value
      ? "var(--neutral-gray-1)"
      : props.background || "var(--neutral-gray-3)"};
  &::placeholder {
    color: var(--primary-color-10);
    opacity: 0.5;
  }
  &:hover,
  &:focus {
    border-color: ${(props) =>
      props.value
        ? "var(--neutral-gray-5)"
        : "var(--neutral-gray-3)"} !important;
    box-shadow: none !important;
  }

  input {
    color: ${({ color = "var(--neutral-gray-9)" }: inputProps) => color};
    background: ${(props) =>
      props.value ? "var(--neutral-gray-1)" : "var(--neutral-gray-3)"};
    &::placeholder {
      color: var(--primary-color-10);
      opacity: 0.5;
    }
  }
`;

const StyledEmbedInput = styled(StyledInput)`
  margin-bottom: 12px;
`;

interface inputProps {
  color?: string;
  background?: string;
  padding?: string;
}

type ButtonProps = {
  width?: string;
  margin?: string;
};

const StyledButton = styled(ButtonAntd)`
  & {
    width: ${({ width = "max-content" }: ButtonProps) => `${width}`};
    height: auto;
    padding: 11px 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
