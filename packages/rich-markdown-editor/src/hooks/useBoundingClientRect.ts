import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { useMemo } from "react";

export type AdvancedClientRect = DOMRect & { toJSON: () => string };

export const useBoundingClientRect = (
  editorView: EditorView,
  editorState: EditorState,
  isOpen?: boolean
) => {
  const virtualReference = useMemo(() => {
    if (isOpen) {
      const domNode = editorView?.domAtPos(editorState?.selection?.to)?.node;
      const cursorPosition = editorView?.state?.selection?.to;
      const cursorLeft = editorView?.coordsAtPos(cursorPosition).left;
      let top: number, height: number;

      // nodeType: 3 is a Text node.
      if (domNode?.nodeType === 3) {
        const coords = editorView?.coordsAtPos(cursorPosition);
        top = coords.bottom;
        height = 0;
      }

      if (domNode instanceof HTMLElement) {
        const clientRect = domNode?.getBoundingClientRect();
        top = clientRect.top;
        height = clientRect.height;
      }

      return {
        getBoundingClientRect(): AdvancedClientRect {
          return {
            top: top,
            right: cursorLeft,
            bottom: top,
            left: cursorLeft,
            width: 0,
            height: height,
            x: cursorLeft,
            y: top,
            toJSON: () =>
              JSON.stringify({
                top: top,
                right: cursorLeft,
                bottom: top,
                left: cursorLeft,
                width: 0,
                height: height,
                x: cursorLeft,
                y: top,
              }),
          };
        },
      };
    }
  }, [editorView, editorView?.state, window.scrollY, isOpen]);

  return virtualReference?.getBoundingClientRect();
};
