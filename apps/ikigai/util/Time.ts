import * as dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import { Dayjs } from "dayjs";

dayjs.locale("en", {
  weekStart: 1,
});
dayjs.extend(utc);
dayjs.extend(relativeTime);

export enum FormatType {
  DateFormat = "DD MMM, YYYY",
  DateTimeFormat = "DD/MM/YYYY HH:mm",
}

export const formatTimestamp = (
  timestamp: number,
  format = FormatType.DateFormat,
): string => {
  const d = dayjs.unix(timestamp);
  return d.format(format);
};

export const getNowAsSec = (): number => {
  return dayjs.utc().unix();
};

export const getNow = (): Dayjs => {
  return dayjs.utc();
};

export const convertTsToDate = (timestamp: number): Dayjs => {
  // Sometimes, the world change the timezone of space
  const m = dayjs.unix(timestamp);
  if (m.year() == 1970) {
    // Just return correct day (of week), hour, minutes
    // 31449600 = 52 weeks in seconds ~ 1 year. But we can keep correct date
    return dayjs.unix(timestamp + (getNow().year() - 1970) * 31449600);
  }
  return m;
};

export const fromNow = (timestamp: number): string => {
  const d = convertTsToDate(timestamp);
  return d.fromNow(true);
};
