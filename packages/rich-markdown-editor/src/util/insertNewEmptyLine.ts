import { TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

export const insertNewEmptyLine = (editorView: EditorView): void => {
  const { state, dispatch } = editorView;
  // get the next position to insert an empty TextSelection
  const offset = state.tr.selection.anchor + 1;
  const tr = state.tr
    .replaceSelectionWith(state.schema.nodes.paragraph.create())
    .scrollIntoView();
  const resolvedPos = tr.doc.resolve(offset);
  tr.setSelection(TextSelection.near(resolvedPos));
  dispatch(tr);
};
