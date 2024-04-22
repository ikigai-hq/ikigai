import type {
  PickerTimeProps,
  RangePickerTimeProps,
} from "antd/es/date-picker/generatePicker";
import type { Moment } from "moment";
import * as React from "react";
import DatePickerWrapper, { DateRangePicker } from "./DatePickerWrapper";

export interface TimePickerProps
  extends Omit<PickerTimeProps<Moment>, "picker"> {}

export interface TimeRangePickerProps
  extends Omit<RangePickerTimeProps<Moment>, "picker"> {}

const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => (
  //@ts-ignore
  <DatePickerWrapper
    {...props}
    picker="time"
    ref={ref}
    changeOnBlur={true}
    popupClassName="time-picker-non-footer"
  />
));

TimePicker.displayName = "TimePicker";

export default TimePicker;

export const TimeRangePicker = React.forwardRef<any, TimeRangePickerProps>(
  (props, ref) => (
    //@ts-ignore
    <DateRangePicker
      {...props}
      picker="time"
      ref={ref}
      changeOnBlur={true}
      popupClassName="time-picker-non-footer"
    />
  ),
);

TimeRangePicker.displayName = "TimeRangePicker";
