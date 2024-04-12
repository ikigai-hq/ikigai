import { wrappingInputRule } from "prosemirror-inputrules";

import toggleWrap from "../commands/toggleWrap";
import { WarningIcon, InfoIcon, StarredIcon } from "outline-icons";
import * as React from "react";
import { createRoot } from "react-dom/client";
import Node from "./Node";
import noticesRule from "../rules/notices";
import { base } from "../styles/theme";
import { Plugin } from "prosemirror-state";
import { Node as ProsemirrorNode } from "prosemirror-model";
import { Decoration, DecorationSet } from "prosemirror-view";
import { CalloutType } from "../types/extensions.enum";
import { isInWritingBlock } from "../queries/isInWritingBlock";
import { findParentNode } from "prosemirror-utils";
import { countWords } from "../util/countWords";

const notices: string[] = Object.keys(CalloutType).map(
  (n) => CalloutType[n] as string
);

export default class Notice extends Node {
  get name() {
    return "container_notice";
  }

  get rulePlugins() {
    return [noticesRule];
  }

  get schema() {
    return {
      attrs: {
        style: {
          default: CalloutType.Info,
        },
      },
      content:
        "(paragraph| ordered_list | bullet_list | checkbox_list| table)+",
      group: "block",
      defining: true,
      parseDOM: [
        {
          tag: "div.notice-block",
          preserveWhitespace: "full",
          contentElement: "div:last-child",
          getAttrs: (dom: HTMLDivElement) => {
            const style = notices.filter((n) => dom.className.includes(n));
            return {
              style: style.length ? style[0] : undefined,
            };
          },
        },
      ],
      toDOM: (node: ProsemirrorNode<any>) => {
        return [
          "div",
          { class: `notice-block ${node.attrs.style}` },
          ["div", { class: `content ${node.attrs.style}` }, 0],
        ];
      },
    };
  }

  get plugins() {
    const isReadOnly = this.options.isReadOnly;
    const getIconByType = (type: string) => {
      switch (type) {
        case CalloutType.Tip:
          return <StarredIcon color="currentColor" />;
        case CalloutType.Warning:
          return <WarningIcon color={base.noticeWarningIcon} />;
        case CalloutType.Info:
          return <InfoIcon color={base.noticeInfoIcon} />;
        default:
          return null;
      }
    };

    const getNoticeBlocks = (doc: ProsemirrorNode<any>) => {
      const decorations: Decoration[] = [];
      doc.descendants((node, pos) => {
        if (node.type.name !== this.name) return;
        const type = node.attrs.style;
        if (type !== CalloutType.Writing) {
          const icon = document.createElement("div");
          icon.className = "icon";
          createRoot(icon).render(getIconByType(type));
          decorations.push(Decoration.widget(pos + 1, () => icon));
        } else {
          const firstChild = node.firstChild;
          if (
            firstChild &&
            firstChild.type.name === "paragraph" &&
            firstChild.content.size === 0
          ) {
            decorations.push(
              Decoration.node(pos + 1, pos + 1 + firstChild.nodeSize, {
                class: "writing-block",
                "data-empty-text":
                  this.options.dictionary.placeholderWritingBlock,
              })
            );
          }
          const endPos = node.content.size;
          const countingWord = document.createElement("div");
          createRoot(countingWord).render(
            <div
              style={{
                textAlign: "right",
                fontSize: 12,
                color: "#888E9C",
                lineHeight: "20px",
                position: "absolute",
                right: 0,
                bottom: 0,
                margin: 4,
              }}
            >
              {`Words count: ${countWords(node.textContent)}`}
            </div>
          );
          decorations.push(
            Decoration.widget(endPos + pos + 1, () => countingWord)
          );
        }
      });
      return DecorationSet.create(doc, decorations);
    };

    return [
      new Plugin({
        state: {
          init(_, state) {
            return getNoticeBlocks(state.doc);
          },
          apply(tr, oldState) {
            return tr.docChanged ? getNoticeBlocks(tr.doc) : oldState;
          },
        },
        filterTransaction(transaction, state) {
          const step = transaction?.steps[0] as any;
          const structureStep: any = step?.structure;
          const slice = step?.slice;
          const writingNode = findParentNode(
            (node) => node.type.name === "container_notice"
          )(state.selection);

          if (
            isInWritingBlock(state) &&
            structureStep &&
            isReadOnly &&
            slice?.content?.content?.length === 0 &&
            writingNode &&
            writingNode.node?.textContent?.length === 0
          )
            return false;
          return true;
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleKeyDown(view, event) {
            const writingNode = findParentNode(
              (node) => node.type.name === "container_notice"
            )(view.state.selection);
            if (
              event.key === "Backspace" &&
              isInWritingBlock(view.state) &&
              view.state.selection.from !== view.state.selection.to &&
              view.state.selection.head - 1 === writingNode?.start &&
              isReadOnly
            ) {
              const range = view.state.selection;
              view.dispatch(
                view.state.tr.insertText(" ", range.from, range.to)
              );
              return true;
            }
            return false;
          },
        },
      }),
    ];
  }

  commands({ type }) {
    return (attrs) => toggleWrap(type, attrs);
  }

  inputRules({ type }) {
    return [wrappingInputRule(/^:::$/, type)];
  }

  toMarkdown(state, node) {
    state.write("\n:::" + (node.attrs.style || "info") + "\n");
    state.renderContent(node);
    state.ensureNewLine();
    state.write(":::");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: "container_notice",
      getAttrs: (tok) => ({ style: tok.info }),
    };
  }
}
