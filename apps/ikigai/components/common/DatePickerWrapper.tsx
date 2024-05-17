import { DatePicker } from "antd";
import dayjsGenerateConfig from "rc-picker/lib/generate/dayjs";
import { Dayjs } from "dayjs";

const DatePickerWrapper = DatePicker.generatePicker<Dayjs>(dayjsGenerateConfig);

export const DateRangePicker = DatePickerWrapper.RangePicker;

export default DatePickerWrapper;
