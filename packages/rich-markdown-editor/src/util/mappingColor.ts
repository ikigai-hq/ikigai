export enum TextColorName {
  DEFAULT = "Default Color",
  GRAY = "Gray",
  BROWN = "Brown",
  ORANGE = "Orange",
  YELLOW = "Yellow",
  GREEN = "Green",
  BLUE = "Blue",
  PURPLE = "Purple",
  PINK = "Pink",
  RED = "Red",
}

export const textColor: { [key in TextColorName]: string } = {
  [TextColorName.DEFAULT]: "#181E2D",
  [TextColorName.GRAY]: "#888E9C",
  [TextColorName.BROWN]: "#874D00",
  [TextColorName.ORANGE]: "#FA541C",
  [TextColorName.YELLOW]: "#FAAD14",
  [TextColorName.GREEN]: "#52C41A",
  [TextColorName.BLUE]: "#1C53F4",
  [TextColorName.PURPLE]: "#AF1CF4",
  [TextColorName.PINK]: "#F41CC4",
  [TextColorName.RED]: "#F5222D",
};

export enum BackgroundTextColor {
  DEFAULT_BG = "Default background",
  GRAY_BG = "Gray background",
  BROWN_BG = "Brown background",
  ORANGE_BG = "Orange background",
  YELLOW_BG = "Yellow background",
  GREEN_BG = "Green background",
  BLUE_BG = "Blue background",
  PURPLE_BG = "Purple background",
  PINK_BG = "Pink background",
  RED_BG = "Red background",
}

export const backgroundTextColor: { [key in BackgroundTextColor]: string } = {
  [BackgroundTextColor.DEFAULT_BG]: "#FFFFF",
  [BackgroundTextColor.GRAY_BG]: "#f1f1ef",
  [BackgroundTextColor.BROWN_BG]: "#f4eeee",
  [BackgroundTextColor.ORANGE_BG]: "#fbecdd",
  [BackgroundTextColor.YELLOW_BG]: "#fbf3db",
  [BackgroundTextColor.GREEN_BG]: "#edf3ec",
  [BackgroundTextColor.BLUE_BG]: "#e7f3f8",
  [BackgroundTextColor.PURPLE_BG]: "#f4f0f7cc",
  [BackgroundTextColor.PINK_BG]: "#f9eef3cc",
  [BackgroundTextColor.RED_BG]: "#fdebec",
};
