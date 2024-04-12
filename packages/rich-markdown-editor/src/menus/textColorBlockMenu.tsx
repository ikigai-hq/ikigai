import { backgroundTextColor, textColor } from "../util/mappingColor";
import { GroupBlock, MenuItem } from "../types";

export const textColorBlockMenu = (name = "paragraph"): MenuItem[] => {
  return Object.keys(textColor).map((m) => ({
    group: GroupBlock.TextColor,
    name,
    title: m,
    textColor: textColor[m],
    keywords: m,
    attrs: { color: textColor[m] },
  }));
};

export const backgroundTextColorBlockMenu = (
  name = "paragraph"
): MenuItem[] => {
  return Object.keys(backgroundTextColor).map((m) => ({
    group: GroupBlock.TextColor,
    name,
    title: m,
    bgColor: backgroundTextColor[m],
    keywords: m,
    attrs: { bg: backgroundTextColor[m] },
  }));
};
