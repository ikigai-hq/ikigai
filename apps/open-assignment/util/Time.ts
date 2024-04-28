import moment, { Moment } from "moment";

export enum FormatType {
  DateFormat = "DD/MM/YYYY",
  DateReadableFormat = "DD MMM, YYYY",
  DateTimeFormat = "DD/MM/YYYY HH:mm",
  UpdatedType = "HH:mm DD/MM/YYYY",
}

moment.locale("en", {
  week: {
    dow: 1,
  },
});

export const extractSecondDuration = (time: moment.Moment): number => {
  const hour = time.hour();
  const minute = time.minute();
  const seconds = time.seconds();

  return hour * 3600 + minute * 60 + seconds;
};

export const secondDurationToMoment = (seconds: number): moment.Moment => {
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  const second = seconds % 60;

  return getNow().hour(hour).minute(minute).second(second);
};

export const getNowAsSec = (): number => {
  return moment().unix();
};

export const getNow = (): moment.Moment => {
  return moment();
};

export const convertTsToDate = (timestamp: number): moment.Moment => {
  // Sometimes, the world change the timezone of space
  const m = moment.unix(timestamp);
  if (m.year() == 1970) {
    // Just return correct day (of week), hour, minutes
    // 31449600 = 52 weeks in seconds ~ 1 year. But we can keep correct date
    return moment.unix(timestamp + (getNow().year() - 1970) * 31449600);
  }
  return m;
};

export const getDateAsSec = (date: moment.Moment): number => {
  return date.unix();
};

export const fromNow = (timestamp: number): string => {
  const moment = convertTsToDate(timestamp);
  return moment.fromNow();
};

export const formatMoment = (m: Moment, formatType?: FormatType) => {
  const format = formatType ? formatType : FormatType.DateFormat;
  return m.format(format);
};

export const formatDate = (
  timestamp: number,
  formatType?: FormatType,
): string => {
  const parseMoment = convertTsToDate(timestamp);
  return formatMoment(parseMoment, formatType);
};

export interface ComboBoxItem {
  value: string | number;
  name: string;
}

export const secondsToTimestamp = (seconds: number) => {
  seconds = Math.floor(seconds);
  let m: any = Math.floor(seconds / 60);
  let s: any = seconds - m * 60;

  m = m < 10 ? `0${m}` : m;
  s = s < 10 ? `0${s}` : s;

  return `${m}:${s}`;
};

export const getMomentByStr = (dateStr: string) => {
  return moment(dateStr);
};
