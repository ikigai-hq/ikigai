import styled from "styled-components";
import React from "react";

export const BlockExtensionWrapper = styled.div<{
  $selected: boolean;
  $inline: boolean;
}>`
  position: relative;
  border: ${(props) =>
    `0.5px solid ${props.$selected ? "var(--indigo-9)" : "var(--indigo-4)"}`};
  display: ${(props) => (props.$inline ? "inline-flex" : "block")};
  margin-right: ${(props) => (props.$inline ? "1px" : "0")};
  margin-left: ${(props) => (props.$inline ? "1px" : "0")};
  &:hover {
    cursor: pointer;
  }
`;

export type ExtensionWrapperProps = {
  children: React.ReactNode;
  selected: boolean;
  inline: boolean;
};

export const ExtensionWrapper = ({
  children,
  selected,
  inline,
}: ExtensionWrapperProps) => {
  return (
    <BlockExtensionWrapper $selected={selected} $inline={inline}>
      {children}
    </BlockExtensionWrapper>
  );
};
