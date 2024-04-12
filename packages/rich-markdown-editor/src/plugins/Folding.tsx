import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import Extension from "../lib/Extension";
import { findBlockNodes } from "prosemirror-utils";
import findCollapsedNodes from "../queries/findCollapsedNodes";
import { headingToPersistenceKey } from "../lib/headingToSlug";

export default class Folding extends Extension {
  get name() {
    return "folding";
  }

  get plugins() {
    let loaded = false;

    return [
      new Plugin({
        view: (view) => {
          loaded = false;
          view.dispatch(view.state.tr.setMeta("folding", { loaded: true }));
          return {};
        },
        appendTransaction: (transactions, oldState, newState) => {
          if (loaded) return;
          if (
            !transactions.some((transaction) => transaction.getMeta("folding"))
          ) {
            return;
          }

          let modified = false;
          const tr = newState.tr;
          const blocks = findBlockNodes(newState.doc);

          for (const block of blocks) {
            if (block.node.type.name === "heading") {
              const persistKey = headingToPersistenceKey(
                block.node,
                this.editor.props.id
              );
              const persistedState = localStorage?.getItem(persistKey);

              if (persistedState === "collapsed") {
                tr.setNodeMarkup(block.pos, undefined, {
                  ...block.node.attrs,
                  collapsed: true,
                });
                modified = true;
              }
            }
          }

          loaded = true;
          return modified ? tr : null;
        },
        props: {
          decorations: (state) => {
            const { doc } = state;
            const decorations: Decoration[] = findCollapsedNodes(doc).map(
              (block) =>
                Decoration.node(block.pos, block.pos + block.node.nodeSize, {
                  class: "folded-content",
                })
            );

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  }
}
