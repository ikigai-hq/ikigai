import { InputRule } from "prosemirror-inputrules";
import { createRoot } from "react-dom/client";
import * as React from "react";
import { EditorState, Plugin } from "prosemirror-state";
import { isInTable } from "prosemirror-tables";
import { findParentNode } from "prosemirror-utils";
import { Decoration, DecorationSet } from "prosemirror-view";
import Extension from "../lib/Extension";
import { CirclePlusIcon } from "../menus/icons";
import { isInWritingBlock } from "../queries/isInWritingBlock";

const MAX_MATCH = 500;
const OPEN_REGEX = /^\/(\w+)?$/;
const CLOSE_REGEX = /(^(?!\/(\w+)?)(.*)$|^\/(([\w\W]+)\s.*|\s)$|^\/((\W)+)$)/;

export const OPEN_INLINE_REGEX = /^(?!\/(\w+)?)(.*)\/(\w+)?$/;

// based on the input rules code in Prosemirror, here:
// https://github.com/ProseMirror/prosemirror-inputrules/blob/master/src/inputrules.js
export function run(view, from, to, startRegex, inlineRegex, handler) {
  if (view.composing) {
    return false;
  }
  const state = view.state;
  const $from = state.doc.resolve(from);
  if ($from.parent.type.spec.code) {
    return false;
  }

  const textBefore = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - MAX_MATCH),
    $from.parentOffset,
    null,
    "\ufffc"
  );

  const beginMatch = startRegex.exec(textBefore);
  const inlineMatch = inlineRegex.exec(textBefore);
  const finalMatch = beginMatch || inlineMatch;
  const tr = handler(
    state,
    finalMatch,
    finalMatch ? from - finalMatch[0].length : from,
    to
  );
  if (!tr) return false;
  return true;
}

export default class BlockMenuTrigger extends Extension {
  get name() {
    return "blockmenu";
  }

  get plugins() {
    const options = this.options;
    const button = document.createElement("button");
    button.className = "block-menu-trigger";
    button.type = "button";
    createRoot(button).render(<CirclePlusIcon />);

    return [
      new Plugin({
        state: {
          init() {
            return null;
          },
          apply(tr) {
            return tr.getMeta("p")?.pos;
          },
        },
        props: {
          handleClick: () => {
            options.onClose();
            return false;
          },
          handleKeyDown: (view, event) => {
            // Prosemirror input rules are not triggered on backspace, however
            // we need them to be evaluted for the filter trigger to work
            // correctly. This additional handler adds inputrules-like handling.
            if (event.key === "Backspace") {
              // timeout ensures that the delete has been handled by prosemirror
              // and any characters removed, before we evaluate the rule.
              setTimeout(() => {
                const { pos } = view.state.selection.$from;
                return run(
                  view,
                  pos,
                  pos,
                  OPEN_REGEX,
                  OPEN_INLINE_REGEX,
                  (state: EditorState, match) => {
                    const nodeBefore = state.selection?.$from?.nodeBefore;
                    if (nodeBefore && nodeBefore.type.name === "text") {
                      const linkMark = nodeBefore.marks.find(
                        (m) => m.type.name === "link"
                      );
                      if (linkMark) {
                        this.options.onClose();
                        return false;
                      }
                    }
                    if (match) {
                      options.onOpen(match[1]);
                    } else {
                      options.onClose();
                    }
                    return null;
                  }
                );
              });
            }

            // If the query is active and we're navigating the block menu then
            // just ignore the key events in the editor itself until we're done
            if (event.key === "Enter") {
              const { pos } = view.state.selection.$from;
              return run(
                view,
                pos,
                pos,
                OPEN_REGEX,
                OPEN_INLINE_REGEX,
                (state: EditorState, match) => {
                  // just tell Prosemirror we handled it and not to do anything
                  const nodeBefore = state.selection?.$from?.nodeBefore;
                  if (nodeBefore && nodeBefore.type.name === "text") {
                    const linkMark = nodeBefore.marks.find(
                      (m) => m.type.name === "link"
                    );
                    if (linkMark) {
                      return false;
                    }
                  }
                  return match ? true : false;
                }
              );
            }

            return false;
          },
          decorations(state) {
            const decorations: Decoration[] = [];

            const parent = findParentNode(
              (node) => node.type.name === "paragraph"
            )(state.selection);

            if (!parent) {
              return;
            }

            const isEmpty = parent && parent.node.content.size === 0;
            const isSlash = parent && parent.node.textContent === "/";
            const isTopLevel = state.selection.$from.depth === 1;

            if (isTopLevel) {
              if (isEmpty) {
                decorations.push(
                  Decoration.node(
                    parent.pos,
                    parent.pos + parent.node.nodeSize,
                    {
                      class: "placeholder",
                      "data-empty-text": options.dictionary.newLineEmpty,
                    }
                  )
                );
              }

              if (isSlash) {
                decorations.push(
                  Decoration.node(
                    parent.pos,
                    parent.pos + parent.node.nodeSize,
                    {
                      class: "placeholder",
                      "data-empty-text": `  ${options.dictionary.newLineWithSlash}`,
                    }
                  )
                );
              }

              return DecorationSet.create(state.doc, decorations);
            }

            return;
          },
        },
      }),
    ];
  }

  inputRules() {
    return [
      // main regex should match only:
      // /word
      new InputRule(OPEN_REGEX, (state, match) => {
        if (
          match &&
          (state.selection.$from.parent.type.name === "paragraph" ||
            state.selection.$from.parent.type.name === "heading") &&
          !isInTable(state) &&
          !isInWritingBlock(state)
        ) {
          this.options.onOpen(match[1]);
        }
        return null;
      }),
      // invert regex should match some of these scenarios:
      // /<space>word
      // /<space>
      // /word<space>
      new InputRule(CLOSE_REGEX, (state, match) => {
        if (match) {
          this.options.onClose();
        }
        return null;
      }),
      // inline regex should match:
      // (word.?!)/(word)
      new InputRule(OPEN_INLINE_REGEX, (state, match) => {
        if (
          match &&
          (state.selection.$from.parent.type.name === "paragraph" ||
            state.selection.$from.parent.type.name === "heading") &&
          !isInTable(state) &&
          !isInWritingBlock(state)
        ) {
          this.options.onOpen(match[3]);
        }
        return null;
      }),
    ];
  }
}
