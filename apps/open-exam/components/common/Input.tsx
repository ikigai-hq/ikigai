import { Input as InputAntd } from "antd";
import styled from "styled-components";
interface inputProps {
  color?: string;
  background?: string;
  padding?: string;
}

const { TextArea, Search } = InputAntd;

export const Input = styled(InputAntd)<inputProps>`
  border: 1px solid
    ${(props) =>
      props.value ? props.theme.colors.gray[4] : props.theme.colors.gray[2]};
  border-radius: 4px;
  box-shadow: none;
  font-weight: 400;
  font-size: 16px;
  padding: ${(props) => props.padding || "14px 12px"};
  /* padding: 14px 12px; */
  width: 100%;
  outline: none;
  color: ${(props) => props.color || props.theme.colors.gray[8]};
  background: ${(props) =>
    props.value
      ? props.theme.colors.gray[0]
      : props.background || props.theme.colors.gray[2]} !important;
  &::placeholder {
    color: ${(props) => props.theme.colors.blue[9]};
    opacity: 0.5;
  }
  &:hover,
  &:focus {
    border-color: ${(props) =>
      props.value
        ? props.theme.colors.gray[4]
        : props.theme.colors.gray[2]} !important;
    box-shadow: none !important;
  }

  input {
    color: ${(props) => props.color || props.theme.colors.gray[8]};
    background: ${(props) =>
      props.value ? props.theme.colors.gray[0] : props.theme.colors.gray[2]};
    &::placeholder {
      color: ${(props) => props.theme.colors.blue[9]};
      opacity: 0.5;
    }
  }
`;

export const InputArea = styled(TextArea)<{ $isActive?: boolean }>`
  border: 1px solid
    ${(props) =>
      props.value || props.$isActive
        ? props.theme.colors.gray[3]
        : props.theme.colors.gray[2]};
  border-radius: 8px;
  box-shadow: none;
  font-weight: 400;
  font-size: 16px;
  padding: 7px 12px;
  width: 100%;
  outline: none;
  color: ${(props) => props.theme.colors.gray[8]};
  background: ${(props) =>
    props.value || props.$isActive
      ? props.theme.colors.gray[0]
      : props.theme.colors.gray[2]};
  &::placeholder {
    color: ${(props) => props.theme.colors.blue[9]};
    opacity: 0.5;
  }

  &:hover,
  &:focus {
    border-color: ${(props) =>
      props.value || props.$isActive
        ? props.theme.colors.gray[3]
        : props.theme.colors.gray[2]};
    box-shadow: none;
  }
`;

export const SearchInput = styled(Search)`
  input {
    border-color: ${(props) => props.theme.colors.gray[4]};
  }

  button {
    svg {
      color: ${(props) => props.theme.colors.gray[8]};
    }
  }
`;
