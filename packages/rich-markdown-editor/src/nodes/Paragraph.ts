import { setBlockType } from "prosemirror-commands";
import Node from "./Node";

export default class Paragraph extends Node {
  get name() {
    return "paragraph";
  }

  get schema() {
    return {
      attrs: {
        color: {
          default: "",
        },
      },
      content: "inline*",
      group: "block",
      draggable: false,
      selectable: false,
      parseDOM: [
        {
          tag: "p",
          getAttrs: (dom: HTMLElement) => ({
            color: dom.getAttribute("color"),
          }),
        },
      ],
      toDOM: (node) => {
        return [
          "p",
          node.attrs.color ? { style: `color: ${node.attrs.color}` } : {},
          0,
        ];
      },
    };
  }

  keys({ type }) {
    return {
      "Shift-Ctrl-0": setBlockType(type),
    };
  }

  commands({ type }) {
    return (attrs) => setBlockType(type, attrs);
  }

  toMarkdown(state, node) {
    // render empty paragraphs as hard breaks to ensure that newlines are
    // persisted between reloads (this breaks from markdown tradition)
    if (
      node.textContent.trim() === "" &&
      node.childCount === 0 &&
      !state.inTable
    ) {
      state.write("\\\n");
    } else {
      // state.write(`${node.attrs.color};-;`);
      state.renderInline(node);
      state.closeBlock(node);
    }
  }

  parseMarkdown() {
    return {
      block: "paragraph",
      getAttrs: (tok) => {
        return { color: tok.info };
      },
    };
  }
}
