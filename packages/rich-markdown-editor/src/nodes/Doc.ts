import Node from "./Node";

import { Transaction, Plugin } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";
import { copyBlock } from "../util/copyBlock";

export default class Doc extends Node {
  get name() {
    return "doc";
  }

  get schema() {
    // const linesCount = this.options.linesCount || 1;
    return {
      // Init default doc with 5 blocks or more
      // content: `block{${linesCount}, }`,
      content: "block+",
    };
  }

  get plugins() {
    return [
      new Plugin({
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply: (tr: Transaction, set: DecorationSet) => {
            return set;
          },
        },
        props: {
          handleDOMEvents: {
            copy: (view, event: ClipboardEvent) => {
              return copyBlock(view, event);
            },
          },
        },
      }),
    ];
  }
}
