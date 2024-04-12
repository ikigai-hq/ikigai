import { EditorState, TextSelection } from "prosemirror-state";
import { findBlockNodes } from "prosemirror-utils";
import { NodeType } from "prosemirror-model";
import findCollapsedNodes from "../queries/findCollapsedNodes";

export default function splitHeading(type: NodeType) {
  return (state: EditorState, dispatch): boolean => {
    const { $from, from, $to, to } = state.selection;

    // check we're in a matching heading node
    if ($from.parent.type !== type) return false;

    // check that the caret is at the end of the content, if it isn't then
    // standard node splitting behaviour applies
    const endPos = $to.after() - 1;
    if (endPos !== to) return false;

    // If the node isn't collapsed standard behavior applies
    if (!$from.parent.attrs.collapsed) return false;

    // Find the next visible block after this one. It takes into account nested
    // collapsed headings and reaching the end of the document
    const allBlocks = findBlockNodes(state.doc);
    const collapsedBlocks = findCollapsedNodes(state.doc);
    const visibleBlocks = allBlocks.filter(
      (a) => !collapsedBlocks.find((b) => b.pos === a.pos)
    );
    const nextVisibleBlock = visibleBlocks.find((a) => a.pos > from);
    const pos = nextVisibleBlock
      ? nextVisibleBlock.pos
      : state.doc.content.size;

    // Insert our new heading directly before the next visible block
    const transaction = state.tr.insert(
      state.doc.content.size,
      state.schema.nodes.paragraph.create()
      // type.create({ ...$from.parent.attrs, collapsed: false })
    );

    // Move the selection into the new heading node and make sure it's on screen
    dispatch(
      transaction
        .setSelection(
          TextSelection.near(
            transaction.doc.resolve(
              Math.min(pos + 1, transaction.doc.content.size)
            )
          )
        )
        .scrollIntoView()
    );

    return true;
  };
}
