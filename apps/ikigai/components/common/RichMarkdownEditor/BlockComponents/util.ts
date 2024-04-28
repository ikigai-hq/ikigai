import { NodeSelection } from "prosemirror-state";
import { copyBlock } from "@ikigai/editor/dist/util/copyBlock";
import { NodeComponentOptions } from "@ikigai/editor/dist/lib/ComponentView";
import Editor from "@ikigai/editor";

export const selectAndCopyNode = (
  options: NodeComponentOptions,
  editor: Editor,
  shouldCopy = true,
) => {
  const { componentView, getPos } = options;
  const {
    view: { state, dispatch },
  } = editor;
  const transaction = state.tr.setSelection(
    new NodeSelection(state.doc.resolve(getPos())),
  );
  dispatch(transaction.scrollIntoView());
  if (shouldCopy) copyBlock(componentView?.view);
  editor.view.focus();
};
