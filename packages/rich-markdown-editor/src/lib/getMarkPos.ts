import { Node } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { ExtensionName } from "../types/extensions.enum";

type MarkPos = {
  start: number;
  end: number;
  marks?: { node: Node; pos: number }[];
};

export default function getMarkPos(
  view: EditorView,
  annotationId: string
): MarkPos {
  const initialMarkPos: MarkPos = { start: -1, end: 1 };
  const annotationMarks: { node: Node; pos: number }[] = [];
  view.state.doc.descendants((node, pos) => {
    if (node.marks.some((m) => m.type.name === ExtensionName.Annotation)) {
      annotationMarks.push({ node, pos });
    }
  });
  const foundMarks = annotationMarks.filter((m) =>
    m.node.marks.find((sm) => sm.attrs.id === annotationId)
  );
  if (foundMarks.length === 1) {
    return {
      start: foundMarks[0].pos,
      end:
        foundMarks[0].pos + Math.max(foundMarks[0].node.textContent.length, 1),
    };
  }
  if (foundMarks.length > 1) {
    return {
      start: foundMarks[0].pos,
      end:
        foundMarks[1].pos + Math.max(foundMarks[1].node.textContent.length, 1),
      marks: foundMarks,
    };
  }
  return initialMarkPos;
}
