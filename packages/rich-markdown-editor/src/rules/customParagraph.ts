/* eslint-disable prefer-const */
import MarkdownIt from "markdown-it";
// import { hexColorRegex } from "../util/regex";

export default function customMarkdownParagraph(md: MarkdownIt) {
  function customParagraph(state, startLine, endLine) {
    let terminate,
      i,
      l,
      token,
      oldParentType,
      nextLine = startLine + 1,
      terminatorRules = state.md.block.ruler.getRules("paragraph");

    oldParentType = state.parentType;
    state.parentType = "paragraph";

    // jump line-by-line until empty one or EOF
    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.sCount[nextLine] - state.blkIndent > 3) {
        continue;
      }

      // quirk for blockquotes, this line should already be checked by that rule
      if (state.sCount[nextLine] < 0) {
        continue;
      }

      // Some tags can terminate paragraph without empty line.
      terminate = false;
      for (i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) {
        break;
      }
    }

    const contentValue: string = state
      .getLines(startLine, nextLine, state.blkIndent, false)
      .trim();

    const splitContent = contentValue.split(";-;");
    const hexColor = contentValue.match(/(#.{6})/)?.[0];

    state.line = nextLine;
    token = state.push("paragraph_open", "p", 1);
    token.info = hexColor;
    token.map = [startLine, state.line];

    token = state.push("inline", "", 0);

    if (splitContent[0].length === 0) {
      token.content = splitContent[1];
    } else {
      token.content = splitContent[0]
        .slice(0, splitContent[0].indexOf("#"))
        .concat(splitContent[1]);
    }

    token.map = [startLine, state.line];
    token.children = [];

    token = state.push("paragraph_close", "p", -1);

    state.parentType = oldParentType;

    return true;
  }

  md.block.ruler.at("paragraph", customParagraph);
}
