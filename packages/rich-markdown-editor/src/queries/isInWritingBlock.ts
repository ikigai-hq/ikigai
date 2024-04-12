import { EditorState } from "prosemirror-state";
import { CalloutType } from "../types/extensions.enum";

export const isInWritingBlock = (state: EditorState) => {
  const $head = state.selection.$head;
  for (let d = $head.depth; d > 0; d--)
    if (
      $head.node(d).type.name === "container_notice" &&
      $head.node(d).attrs?.style === CalloutType.Writing
    )
      return true;
  return false;
};
