import {
  GOOGLE_DOC_REGEX,
  GOOGLE_PPT_REGEX,
  GOOGLE_SHEET_REGEX,
  YOUTUBE_REGEX,
} from "./RegexMatch";

const MICROSOFT_ONE_DRIVE = "https://onedrive.live.com/embed";

export const convertToSupportEmbedLink = (url: string): string | undefined => {
  if (url.match(YOUTUBE_REGEX)) {
    const items = url.match(YOUTUBE_REGEX) || [];
    if (items.length >= 2) {
      return `https://www.youtube.com/embed/${items[1]}?modestbranding=1`;
    }
    return url;
  }
  if (url.match(GOOGLE_DOC_REGEX)) return url;
  if (url.match(GOOGLE_SHEET_REGEX)?.length) return url;
  if (url.match(GOOGLE_PPT_REGEX)?.length) {
    const components = url.match(GOOGLE_PPT_REGEX) || [];
    if (components.length >= 3) {
      return `https://docs.google.com/presentation/d/${components[2]}/embed`;
    }

    return url;
  }
  if (url.includes(MICROSOFT_ONE_DRIVE)) return url;
};
