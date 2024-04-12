// Adapted from:
// https://github.com/markdown-it/markdown-it/blob/master/lib/rules_inline/emphasis.js
// https://npmdoc.github.io/node-npmdoc-markdown-it/build/apidoc.html#apidoc.element.markdown-it.emphasis.postProcess
// https://npmdoc.github.io/node-npmdoc-markdown-it/build/apidoc.html#apidoc.element.markdown-it.emphasis.tokenize

import scanDelim from "../util/scanDelim";

export default function customizeEmphasisRule() {
  return function emphasisPlugin(md) {
    function tokenize(state, silent) {
      let token;
      const start = state.pos;
      const marker = state.src.charCodeAt(start);

      if (silent) {
        return false;
      }

      if (marker !== 0x5f /* _ */ && marker !== 0x2a /* * */) {
        return false;
      }

      const scanned = scanDelim(state.pos, marker === 0x2a, state.src);

      for (let i = 0; i < scanned.length; i++) {
        token = state.push("text", "", 0);
        token.content = String.fromCharCode(marker);

        state.delimiters.push({
          // Char code of the starting marker (number).
          //
          marker: marker,

          // Total length of these series of delimiters.
          //
          length: scanned.length,

          // An amount of characters before this one that's equivalent to
          // current one. In plain English: if this delimiter does not open
          // an emphasis, neither do previous `jump` characters.
          //
          // Used to skip sequences like "*****" in one step, for 1st asterisk
          // value will be 0, for 2nd it's 1 and so on.
          //
          jump: i,

          // A position of the token this delimiter corresponds to.
          //
          token: state.tokens.length - 1,

          // Token level.
          //
          level: state.level,

          // If this delimiter is matched as a valid opener, `end` will be
          // equal to its position, otherwise it's `-1`.
          //
          end: -1,

          // Boolean flags that determine if this delimiter could open or close
          // an emphasis.
          //
          open: scanned.can_open,
          close: scanned.can_close,
        });
      }

      state.pos += scanned.length;

      return true;
    }

    // Walk through delimiter list and replace text tokens with tags
    function postProcess(state, delimiters) {
      let i, startDelim, endDelim, token;

      const max = delimiters.length;

      for (i = 0; i < max; i++) {
        startDelim = delimiters[i];

        if (
          startDelim.marker !== 0x5f /* _ */ &&
          startDelim.marker !== 0x2a /* * */
        ) {
          continue;
        }

        // Process only opening markers
        if (startDelim.end === -1) {
          continue;
        }

        endDelim = delimiters[startDelim.end];

        // If the next delimiter has the same marker and is adjacent to this one,
        // merge those into one strong delimiter.
        //
        // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
        //
        const isStrong =
          i + 1 < max &&
          delimiters[i + 1].end === startDelim.end - 1 &&
          delimiters[i + 1].token === startDelim.token + 1 &&
          delimiters[startDelim.end - 1].token === endDelim.token - 1 &&
          delimiters[i + 1].marker === startDelim.marker;

        const ch = String.fromCharCode(startDelim.marker);

        token = state.tokens[startDelim.token];
        token.type = isStrong ? "strong_open" : "em_open";
        token.tag = isStrong ? "strong" : "em";
        token.nesting = 1;
        token.markup = isStrong ? ch + ch : ch;
        token.content = "";

        token = state.tokens[endDelim.token];
        token.type = isStrong ? "strong_close" : "em_close";
        token.tag = isStrong ? "strong" : "em";
        token.nesting = -1;
        token.markup = isStrong ? ch + ch : ch;
        token.content = "";

        if (isStrong) {
          state.tokens[delimiters[i + 1].token].content = "";
          state.tokens[delimiters[startDelim.end - 1].token].content = "";
          i++;
        }
      }
    }

    md.disable("emphasis");
    md.inline.ruler.before("emphasis", "emphasisPlugin", tokenize);
    md.inline.ruler2.before("emphasis", "emphasisPlugin", function (state) {
      let curr;
      const tokensMeta = state.tokens_meta,
        max = (state.tokens_meta || []).length;

      postProcess(state, state.delimiters);

      for (curr = 0; curr < max; curr++) {
        if (tokensMeta[curr] && tokensMeta[curr].delimiters) {
          postProcess(state, tokensMeta[curr].delimiters);
        }
      }
    });
  };
}
