import { Space } from "antd";
import styled from "styled-components";

import { Input as InputStyle, InputArea } from "components/common/Input";
import { Text, TextWeight } from "components/common/Text";

export const Container = styled.div`
  background: ${(props) => props.theme.colors.gray[0]};
  border: 1px solid ${(props) => props.theme.colors.gray[3]};
  border-radius: 8px;
  padding: 24px 28px;
  margin-bottom: 16px;
`;

export const Box = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 614px;
`;

export const Input = styled(InputStyle)`
  padding: 5px 12px;
  font-size: 14px;
`;

export const TextArea = styled(InputArea)`
  padding: 5px 12px;
  font-size: 14px;
`;

export const Title = styled(Text)`
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: ${TextWeight.bold};
  color: ${(props) => props.theme.colors.gray[8]};
  display: block;
`;

export const TitleBox = styled(Text)`
  display: block;
  color: ${(props) => props.theme.colors.gray[8]};
  margin-bottom: 8px;
`;

export const ActionButton = styled(Space)`
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.blue[5]};
  font-size: 14px;
  font-weight: ${TextWeight.bold};

  svg {
    height: 10px;
  }
`;
