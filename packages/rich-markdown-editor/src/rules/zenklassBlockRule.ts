import MarkdownIt from "markdown-it";

const uuidRegexp =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const urlRegexp =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gm;

export const zenklassBlockRule = (
  markerCode: number,
  blockName: string,
  isEmbed = false
) => {
  return function zenklassBlock(md: MarkdownIt): void {
    function container(state, startLine, endLine, silent) {
      // console.log("tokens in zenklass block rule:", state.tokens);
      let len,
        nextLine,
        mem,
        haveEndMarker = false,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

      // the line length is less than 3, not a query block
      if (pos + 3 > max) {
        return false;
      }

      // first none-space char
      const marker = state.src.charCodeAt(pos);

      // first char is not markerCode => not a hyperquery block
      if (marker !== markerCode) {
        return false;
      }

      // scan marker length
      mem = pos;
      pos = state.skipChars(pos, marker);

      len = pos - mem;

      if (len < 3) {
        return false;
      }

      const markup = state.src.slice(mem, pos);
      const params = state.src.slice(pos, max);

      if (params.indexOf(String.fromCharCode(marker)) >= 0) {
        return false;
      }

      // checking match for valid uuid or url
      if (!isEmbed) {
        if (params.length !== 36) {
          return false;
        }
        if (!params.match(uuidRegexp)) {
          return false;
        }
      } else {
        if (!params.match(urlRegexp)) {
          return false;
        }
      }

      // Since start is found, we can report success here in validation mode
      if (silent) {
        return true;
      }

      // search end of block
      nextLine = startLine;

      for (;;) {
        nextLine++;
        if (nextLine >= endLine) {
          // unclosed block should be autoclosed by end of document.
          // also block seems to be autoclosed by end of parent
          break;
        }

        pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (pos < max && state.sCount[nextLine] < state.blkIndent) {
          // non-empty line with negative indent should stop the list:
          // - ```
          //  test
          break;
        }

        if (state.src.charCodeAt(pos) !== marker) {
          continue;
        }

        if (state.sCount[nextLine] - state.blkIndent >= 4) {
          // closing fence should be indented less than 4 spaces
          continue;
        }

        pos = state.skipChars(pos, marker);

        // closing code fence must be at least as long as the opening one
        if (pos - mem < len) {
          continue;
        }

        // make sure tail has spaces only
        pos = state.skipSpaces(pos);

        if (pos < max) {
          continue;
        }

        haveEndMarker = true;
        // found!
        break;
      }

      // If a fence has heading spaces, they should be removed from its inner block
      len = state.sCount[startLine];

      state.line = nextLine + (haveEndMarker ? 1 : 0);

      const token = state.push(blockName, `${blockName}_zenklass`, 0);
      token.info = params;
      token.content = state.getLines(startLine + 1, nextLine, len, true);
      token.markup = markup;
      token.map = [startLine, state.line];

      return true;
    }

    // put the rule before code block rule because that rule looks for 4 space padded blocks
    // which sometime can be the query block inside the bullet list.
    // https://github.com/markdown-it/markdown-it/blob/master/lib/rules_block/code.js
    md.block.ruler.before("code", blockName, container, {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });
  };
};
