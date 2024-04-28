import { DefaultTheme } from "styled-components";
import {
  red,
  volcano,
  orange,
  gold,
  yellow,
  lime,
  green,
  cyan,
  geekblue,
  magenta,
  purple,
  blue,
} from "@ant-design/colors";

const primary = [
  "#ECFFF4",
  "#CCF7DF",
  "#9BF0C9",
  "#63D4AA",
  "#39A98A",
  "#0D715F",
  "#075345",
  "#065051",
  "#043B41",
  "#022C36",
  "#181e2df5",
];

const theme: DefaultTheme = {
  name: "default",
  token: {
    colorPrimaryBg: primary[0],
    colorPrimaryBgHover: primary[1],
    colorPrimaryBorder: primary[2],
    colorPrimaryBorderHover: primary[6],
    colorPrimaryHover: primary[6],
    colorPrimary: primary[5],
    colorPrimaryActive: primary[6],
    colorPrimaryTextHover: primary[7],
    colorPrimaryText: primary[8],
    colorPrimaryTextActive: primary[9],
    colorBgMask: "#181e2df5",
    fontFamily: `Inter, sans-serif`,
  },
  components: {
    Modal: {
      borderRadiusLG: 12,
    },
  },
  colors: {
    // Primary
    primary,
    // Dust Red
    red,
    // Volcano
    volcano,
    // Sunset Orange
    orange,
    // Calendula Gold
    gold,
    // Sunrise Yellow
    yellow,
    // Lime
    lime,
    // Polar Green
    green,
    // Cyan
    cyan,
    // Geek Blue
    geekblue,
    // Daybreak Blue
    blue,
    // Golden Purple
    purple,
    // Magenta
    magenta,

    // Gray
    gray: [
      "#FFFFFF",
      "#F9FAFB",
      "#F4F5F7",
      "#EAECEF",
      "#D5D8DD",
      "#AFB4BE",
      "#888E9C",
      "#4D5562",
      "#272F3E",
      "#181E2D",
      "#000000",
    ],

    // Others
    backgroundUserCredential: "#01133f",
    extraBackground1: "#f5f6f9",
    announcement1: "#ebfbff",
    selection1: "#ECFFF4",
  },
};

export default theme;
