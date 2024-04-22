import { InputNumber as InputNumerAntd } from "antd";
import styled from "styled-components";

interface inputProps {
  color?: string;
  background?: string;
}

export const InputNumber = styled(InputNumerAntd)<inputProps>`
  border: ${(props) =>
    `${
      props.background
        ? props.background
        : `1px solid ${props.theme.colors.gray[4]}`
    }`};
  border-radius: 4px;
  box-shadow: none;
  font-weight: 400;
  font-size: 16px;
  width: 100%;
  outline: none;
  color: ${(props) => props.color || props.theme.colors.gray[8]};
  min-height: 32px;
  &::placeholder {
    color: ${(props) => props.theme.colors.blue[9]};
    opacity: 0.5;
  }
  ${({ background }: inputProps) =>
    !!background ? `background: ${background}` : ""}
`;
