import MarkdownIt from "markdown-it";
import ParserInline from "markdown-it/lib/parser_inline";
import StateInline from "markdown-it/lib/rules_inline/state_inline";

const inlineBlockRule =
  (
    blockName: string,
    openingMarker: string,
    closingMarker: string,
    markerLength: number
  ) =>
  (md: MarkdownIt): void => {
    const container: ParserInline.RuleInline = (
      state: StateInline,
      isSilent: boolean
    ) => {
      if (isSilent) {
        return false;
      }

      const start = state.pos;

      const marker = state.src.slice(start, start + markerLength);
      if (marker !== openingMarker) {
        return false;
      }

      const infoStartPos = start + markerLength;
      const info = state.src.substring(
        state.src.indexOf(openingMarker, start) + markerLength, // First Open Marker after start position
        state.src.indexOf(closingMarker, start) // First Close marker after start position
      );

      // check if the closing marker is present
      let current = infoStartPos + info.length;
      while (
        current < state.posMax &&
        state.src.slice(current, current + markerLength) !== closingMarker
      ) {
        current += 1;
      }

      if (current === state.posMax) {
        return false;
      }

      const openingToken = state.push(`${blockName}_open`, blockName, 0);
      openingToken.info = info;
      openingToken.markup = marker;

      // set the parser to the closing marker
      state.pos = current;

      const closingToken = state.push(`${blockName}_close`, blockName, 0);
      closingToken.info = info;
      closingToken.markup = closingMarker;

      // set the parser to after the closing marker
      state.pos += markerLength;
      return true;
    };

    md.inline.ruler.after("text", blockName, container);
  };

export default inlineBlockRule;
