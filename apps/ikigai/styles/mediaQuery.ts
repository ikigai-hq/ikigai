interface IBreakpoints {
  desktop: string;
  tablet: string;
  mobile: string;
}

export enum Devices {
  desktop = 1024,
  tablet = 768,
  mobile = 512,
}

export const BreakPoints: IBreakpoints = {
  desktop: `@media screen and (min-width: ${Devices.desktop}px)`,
  tablet: `@media screen and (max-width: ${Devices.desktop - 1}px)`,
  mobile: `@media screen and (max-width: ${Devices.mobile}px)`,
};
