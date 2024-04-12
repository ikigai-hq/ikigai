import {
  isPunctChar,
  isWhiteSpace,
  isMdAsciiPunct,
} from "markdown-it/lib/common/utils";

function scanDelim(start: number, canSplitWord: boolean, src: string) {
  let pos = start,
    can_open: boolean,
    can_close: boolean,
    left_flanking = true,
    right_flanking = true;

  const max = src.length;
  const marker = src.charCodeAt(start);

  // treat beginning of the line as a whitespace
  const lastChar = start > 0 ? src.charCodeAt(start - 1) : 0x20;

  while (pos < max && src.charCodeAt(pos) === marker) {
    pos++;
  }

  const count = pos - start;

  // treat end of the line as a whitespace
  const nextChar = pos < max ? src.charCodeAt(pos) : 0x20;

  const isLastPunctChar =
    isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
  const isNextPunctChar =
    isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

  const isLastWhiteSpace = isWhiteSpace(lastChar);
  const isNextWhiteSpace = isWhiteSpace(nextChar);

  if (isNextWhiteSpace) {
    left_flanking = false;
  }

  if (isLastWhiteSpace) {
    right_flanking = false;
  }

  if (!canSplitWord) {
    can_open = left_flanking && (!right_flanking || isLastPunctChar);
    can_close = right_flanking && (!left_flanking || isNextPunctChar);
  } else {
    can_open = left_flanking;
    can_close = right_flanking;
  }

  return {
    can_open: can_open,
    can_close: can_close,
    length: count,
  };
}

export default scanDelim;
