import { DatePicker } from "antd";
import type { Moment } from "moment";
import momentGenerateConfig from "rc-picker/lib/generate/moment";

const DatePickerWrapper =
  DatePicker.generatePicker<Moment>(momentGenerateConfig);

export const DateRangePicker = DatePickerWrapper.RangePicker;

export default DatePickerWrapper;
