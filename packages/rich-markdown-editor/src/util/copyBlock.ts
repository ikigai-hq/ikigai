import { EditorView, __serializeForClipboard } from "prosemirror-view";
import { findParentNode } from "prosemirror-utils";

interface ClipboardItem {
  readonly types: string[];
  readonly presentationStyle: "unspecified" | "inline" | "attachment";
  getType(): Promise<Blob>;
}

interface ClipboardItemData {
  [mimeType: string]: Blob | string | Promise<Blob | string>;
}

declare const ClipboardItem: {
  prototype: ClipboardItem;
  new (itemData: ClipboardItemData): ClipboardItem;
};

export const copyBlock = (
  view: EditorView,
  event?: ClipboardEvent
): boolean => {
  try {
    const { selection, doc } = view.state;
    const { from, to } = selection;

    const targetNode = (doc.resolve(from) as any).path[3];

    let selectionFrom = from;
    let selectionTo = to;
    if (targetNode) {
      const parentNode = findParentNode(
        (node) => node.type.name === targetNode.type.name
      )(selection);
      if (!parentNode) return false;
      const { pos: currentNodePos, node } = parentNode;
      const endPosOfBlock = currentNodePos + node.nodeSize - 1;
      const isNotBlackedOut = from === to;
      if (isNotBlackedOut) {
        selectionFrom = currentNodePos;
        selectionTo = endPosOfBlock;
      }
    }

    const clipboard = __serializeForClipboard(
      view,
      doc.slice(selectionFrom, selectionTo)
    );

    // Two scenario for copy:
    // 1. Trigger copy from onCopy event function.
    // 2. Trigger copy from another event function.
    if (event) {
      const handler = (event: ClipboardEvent) => {
        event?.clipboardData?.setData("text/plain", clipboard.text);
        event?.clipboardData?.setData("text/html", clipboard.dom.innerHTML);
        event.preventDefault();
      };

      handler(event);
    } else {
      const type = "text/html";
      const blob = new Blob([clipboard.dom.innerHTML], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      const clipboardAPI = navigator.clipboard as any;

      clipboardAPI.write(data);
    }

    return false;
  } catch (e) {
    console.error("Cannot copy block. Reason:", e);
    // In case cannot use clipboard API -> trigger document copy event (firefox)
    document.execCommand("copy");
    return true;
  }
};
