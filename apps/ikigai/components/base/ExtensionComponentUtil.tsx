import styled from "styled-components";
import React from "react";

export const BlockExtensionWrapper = styled.div<{ $selected: boolean }>`
  position: relative;
  border: 1px solid
    ${(props) => (props.$selected ? "var(--indigo-9)" : "var(--indigo-4)")};
  &:hover {
    cursor: pointer;
  }
`;

export type ExtensionWrapperProps = {
  children: React.ReactNode;
  selected: boolean;
};

export const ExtensionWrapper = ({
  children,
  selected,
}: ExtensionWrapperProps) => {
  return (
    <BlockExtensionWrapper $selected={selected}>
      {children}
    </BlockExtensionWrapper>
  );
};
