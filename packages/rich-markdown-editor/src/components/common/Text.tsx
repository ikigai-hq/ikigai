import React from "react";
import styled from "styled-components";

interface TextProps {
  children: React.ReactNode;
  color?: string;
}

export const Text: React.FC<TextProps> = ({ children, color }) => {
  return <TextContainer color={color}>{children}</TextContainer>;
};

const TextContainer = styled.div<{ color?: string }>`
  font-size: 14px;
  line-height: 22px;
  font-weight: 500;
  color: ${({ color }) => color || "#888e9c"};
`;
