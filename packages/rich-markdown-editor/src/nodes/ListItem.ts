import {
  splitListItem,
  sinkListItem,
  liftListItem,
} from "prosemirror-schema-list";
import { TextSelection } from "prosemirror-state";

import Node from "./Node";
import isInList from "../queries/isInList";
import getParentListItem from "../queries/getParentListItem";

export default class ListItem extends Node {
  get name() {
    return "list_item";
  }

  get schema() {
    return {
      content: "paragraph block*",
      defining: true,
      parseDOM: [{ tag: "li" }],
      toDOM: () => ["li", 0],
    };
  }

  keys({ type }) {
    return {
      Enter: splitListItem(type),
      Tab: sinkListItem(type),
      "Shift-Tab": liftListItem(type),
      "Mod-]": sinkListItem(type),
      "Mod-[": liftListItem(type),
      "Shift-Enter": (state, dispatch) => {
        if (!isInList(state)) return false;
        if (!state.selection.empty) return false;

        const { tr, selection } = state;
        dispatch(tr.split(selection.to));
        return true;
      },
      "Alt-ArrowUp": (state, dispatch) => {
        if (!state.selection.empty) return false;
        const result = getParentListItem(state);
        if (!result) return false;

        const [li, pos] = result;
        const $pos = state.doc.resolve(pos);

        if (
          !$pos.nodeBefore ||
          !["list_item", "checkbox_item"].includes($pos.nodeBefore.type.name)
        ) {
          console.log("Node before not a list item");
          return false;
        }

        const { tr } = state;
        const newPos = pos - $pos.nodeBefore.nodeSize;

        dispatch(
          tr
            .delete(pos, pos + li.nodeSize)
            .insert(newPos, li)
            .setSelection(TextSelection.near(tr.doc.resolve(newPos)))
        );
        return true;
      },
      "Alt-ArrowDown": (state, dispatch) => {
        if (!state.selection.empty) return false;
        const result = getParentListItem(state);
        if (!result) return false;

        const [li, pos] = result;
        const $pos = state.doc.resolve(pos + li.nodeSize);

        if (
          !$pos.nodeAfter ||
          !["list_item", "checkbox_item"].includes($pos.nodeAfter.type.name)
        ) {
          console.log("Node after not a list item");
          return false;
        }

        const { tr } = state;
        const newPos = pos + li.nodeSize + $pos.nodeAfter.nodeSize;

        dispatch(
          tr
            .insert(newPos, li)
            .setSelection(TextSelection.near(tr.doc.resolve(newPos)))
            .delete(pos, pos + li.nodeSize)
        );
        return true;
      },
    };
  }

  toMarkdown(state, node) {
    state.renderContent(node);
  }

  parseMarkdown() {
    return { block: "list_item" };
  }
}
