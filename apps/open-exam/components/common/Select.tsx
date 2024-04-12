import { Select as SelectAntd } from "antd";
import styled from "styled-components";

export const Select = styled(SelectAntd)`
  min-height: 32px;
  min-width: 180px;
  width: 100%;

  .ant-select-selector {
    border-radius: 4px !important;
    border-color: ${(props) => `${props.theme.colors.gray[4]} !important`};
    box-shadow: none !important;
  }
`;
