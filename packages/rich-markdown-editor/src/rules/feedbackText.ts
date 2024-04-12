import inlineBlockRule from "./zenklassInlineBlockRule";

export const FEEDBACK_TEXT_BLOCK_NAME = "feedback_text";
const openingMarker = "{rr%";
const closingMarker = "%rr}";
const markerLength = 4;

export default inlineBlockRule(
  FEEDBACK_TEXT_BLOCK_NAME,
  openingMarker,
  closingMarker,
  markerLength
);
