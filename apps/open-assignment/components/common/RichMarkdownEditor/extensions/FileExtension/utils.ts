import { isAudio } from "util/FileType";
import { Size } from "./type";

export const FILE_BLOCK_NAME = "file_block";

export const DEFAULT_FILE_ID = "00000000-0000-0000-0000-000000000000";

export const DEFAULT_FILE_BLOCK_HEIGHT = 443;

export const DEFAULT_FILE_BLOCK_WIDTH = 500;

export const DEFAULT_SIZE: Size = {
  height: DEFAULT_FILE_BLOCK_HEIGHT,
  width: DEFAULT_FILE_BLOCK_WIDTH,
};

export const DEFAULT_AUDIO_BLOCK = 120;

export const DEFAULT_FILE_BLOCK_HEADER = 48;

export const SPACE_BETWEEN_HEADER_BODY = DEFAULT_FILE_BLOCK_HEADER + 20 + 20; // 20: space between header + body.

export const FULLSCREEN_HEIGHT = `calc(100vh - ${DEFAULT_FILE_BLOCK_HEADER}px)`;

export const getHeightByFileType = (height: number, type: string) => {
  if (isAudio(type)) {
    return "unset";
  }

  return `${
    (height === DEFAULT_FILE_BLOCK_HEIGHT
      ? DEFAULT_FILE_BLOCK_HEIGHT
      : height) - SPACE_BETWEEN_HEADER_BODY
  }px`;
};

export const getSizeByFile = () => {
  const width = (document.querySelector(".ProseMirror") as HTMLElement)
    .offsetWidth;
  return { ...DEFAULT_SIZE, width };
};
