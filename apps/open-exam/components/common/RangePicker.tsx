import React from "react";

import { ClockCircleOutlined } from "@ant-design/icons";
import { DatePicker } from "antd";
import styled from "styled-components";
import { Moment } from "moment";

const AntdRangePicker: any = DatePicker.RangePicker;

export const StyledRangePicker = styled(AntdRangePicker)`
  background: ${(props) => props.theme.colors.gray[0]};
  border: ${(props) => `1px solid ${props.theme.colors.gray[4]}`};
  border-radius: 4px;
  box-shadow: none;
`;

interface Props {
  format: string;
  value?: Moment[];
  onChange?: (dates: Moment[]) => void;
}

export const RangePicker: React.FC<Props> = ({ format, value, onChange }) => {
  return (
    <StyledRangePicker
      format={format}
      value={value}
      onChange={onChange}
      suffixIcon={<ClockCircleOutlined />}
    />
  );
};
