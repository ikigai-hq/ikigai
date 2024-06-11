import { Button as ButtonAntd } from "antd";
import styled from "styled-components";

type ButtonProps = {
  customWidth?: string;
  margin?: string;
};

export const Button = styled(ButtonAntd)<ButtonProps>`
  & {
    width: ${({ customWidth = "max-content" }: ButtonProps) =>
      `${customWidth}`};
    height: auto;
    padding: 11px 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const TextButton = styled(Button)`
  padding: 0px;
  text-align: left;
  margin: ${({ margin }: ButtonProps) => `${margin}`};

  &:hover {
    background: transparent;
  }
`;

export const TextButtonWithHover = styled(TextButton)<{
  $isSelected?: boolean;
}>`
  padding: 2px;
  margin-left: 5px;
  margin-right: 5px;
  background: ${(props) => {
    return props.$isSelected
      ? `${props.theme.colors.gray[4]} !important`
      : undefined;
  }};

  &: hover
    ${() => {
      return `background: ${(props) => props.theme.colors.gray[4]}`;
    }};
`;
