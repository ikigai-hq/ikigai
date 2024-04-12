import inlineBlockRule from "./zenklassInlineBlockRule";

export const FILL_IN_BLANK_NAME = "fill_in_blank";
const openingMarker = "{bl%";
const closingMarker = "%lb}";
const markerLength = 4;

export default inlineBlockRule(
  FILL_IN_BLANK_NAME,
  openingMarker,
  closingMarker,
  markerLength
);
