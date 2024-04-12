import {
  Plugin,
  EditorState,
  NodeSelection,
  TextSelection,
} from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { dropPoint } from "prosemirror-transform";
import { ResolvedPos } from "prosemirror-model";

interface DropCursorOptions {
  /// The color of the cursor. Defaults to `black`. Use `false` to apply no color and rely only on class.
  color?: string | false;

  /// The precise width of the cursor in pixels. Defaults to 1.
  width?: number;

  /// A CSS class name to add to the cursor element.
  class?: string;
}

/// Create a plugin that, when added to a ProseMirror instance,
/// causes a decoration to show up at the drop position when something
/// is dragged over the editor.
///
/// Nodes may add a `disableDropCursor` property to their spec to
/// control the showing of a drop cursor inside them. This may be a
/// boolean or a function, which will be called with a view and a
/// position, and should return a boolean.
export function dropCursor(options: DropCursorOptions = {}): Plugin {
  return new Plugin({
    view(editorView) {
      return new DropCursorView(editorView, options);
    },
  });
}

export function selectionBetween(
  view: EditorView,
  $anchor: ResolvedPos,
  $head: ResolvedPos,
  bias?: number
) {
  return (
    view.someProp("createSelectionBetween", (f) => f(view, $anchor, $head)) ||
    TextSelection.between($anchor, $head, bias)
  );
}

class DropCursorView {
  width: number;
  color: string | undefined;
  class: string | undefined;
  cursorPos: number | null = null;
  element: HTMLElement | null = null;
  timeout = -1;
  handlers: { name: string; handler: (event: Event) => void }[];

  constructor(readonly editorView: EditorView, options: DropCursorOptions) {
    this.width = options.width ?? 1;
    this.color = options.color === false ? undefined : options.color || "black";
    this.class = options.class;

    this.handlers = ["dragover", "dragend", "drop", "dragleave"].map((name) => {
      const handler = (e: Event) => {
        (this as any)[name](e);
      };
      editorView.dom.addEventListener(name, handler);
      return { name, handler };
    });
  }

  destroy() {
    this.handlers.forEach(({ name, handler }) =>
      this.editorView.dom.removeEventListener(name, handler)
    );
  }

  update(editorView: EditorView, prevState: EditorState) {
    if (this.cursorPos !== null && prevState.doc !== editorView.state.doc) {
      if (this.cursorPos > editorView.state.doc.content.size) {
        this.setCursor(null);
      } else this.updateOverlay();
    }
  }

  setCursor(pos: number | null) {
    if (pos === this.cursorPos) return;
    this.cursorPos = pos;
    if (pos === null) {
      this.element!.parentNode!.removeChild(this.element!);
      this.element = null;
    } else {
      this.updateOverlay();
    }
  }

  updateOverlay() {
    const $pos = this.editorView.state.doc.resolve(this.cursorPos!);
    const isBlock = !$pos.parent.inlineContent;
    let rect:
      | {
          left: number;
          top: number;
          right: number;
          bottom: number;
        }
      | undefined = undefined;

    const editorDOM = this.editorView.dom as HTMLElement;
    const editorRect = editorDOM.getBoundingClientRect();
    const scaleX = editorRect.width / editorDOM.offsetWidth;
    const scaleY = editorRect.height / editorDOM.offsetHeight;

    if (isBlock) {
      const before = $pos.nodeBefore;
      const after = $pos.nodeAfter;

      // console.log({ before, after, $pos });
      if (before || after) {
        const node = this.editorView.nodeDOM(
          this.cursorPos! - (before ? before.nodeSize : 0)
        );
        if (node) {
          const nodeRect = (node as HTMLElement).getBoundingClientRect();
          let top = before ? nodeRect.bottom : nodeRect.top;
          if (before && after)
            top =
              (top +
                (
                  this.editorView.nodeDOM(this.cursorPos!) as HTMLElement
                ).getBoundingClientRect().top) /
              2;
          const halfWidth = (this.width / 2) * scaleY;
          rect = {
            left: nodeRect.left,
            right: nodeRect.right,
            top: top - halfWidth,
            bottom: top + halfWidth,
          };
        }
      }
    }
    if (!rect) {
      const coords = this.editorView.coordsAtPos(this.cursorPos!);
      const halfWidth = (this.width / 2) * scaleX;
      rect = {
        left: coords.left - halfWidth,
        right: coords.left + halfWidth,
        top: coords.top,
        bottom: coords.bottom,
      };
    }

    const parent = (this.editorView.dom as HTMLElement)
      .offsetParent as HTMLElement;

    if (!this.element) {
      this.element = parent.appendChild(document.createElement("div"));
      if (this.class) this.element.className = this.class;
      this.element.style.cssText =
        "position: absolute; z-index: 50; pointer-events: none;";
      if (this.color) {
        this.element.style.backgroundColor = this.color;
      }
    }
    this.element.classList.toggle("prosemirror-dropcursor-block", isBlock);
    this.element.classList.toggle("prosemirror-dropcursor-inline", !isBlock);
    let parentLeft, parentTop;
    if (
      !parent ||
      (parent === document.body &&
        getComputedStyle(parent).position === "static")
    ) {
      parentLeft = -pageXOffset;
      parentTop = -pageYOffset;
    } else {
      const rect = parent.getBoundingClientRect();
      const parentScaleX = rect.width / parent.offsetWidth;
      const parentScaleY = rect.height / parent.offsetHeight;
      parentLeft = rect.left - parent.scrollLeft * parentScaleX;
      parentTop = rect.top - parent.scrollTop * parentScaleY;
    }

    this.element.style.left = (rect.left - parentLeft) / scaleX + "px";
    this.element.style.top = (rect.top - parentTop) / scaleY + "px";
    this.element.style.width = (rect.right - rect.left) / scaleX + "px";
    this.element.style.height = (rect.bottom - rect.top + 1) / scaleY + "px";
  }

  scheduleRemoval(timeout: number) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.setCursor(null), timeout);
  }

  dragover(event: DragEvent) {
    event.preventDefault();
    if (!this.editorView.editable) return;
    const pos = this.editorView.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    });

    const node =
      pos && pos.inside >= 0 && this.editorView.state.doc.nodeAt(pos.inside);

    const disableDropCursor = node && node.type.spec.disableDropCursor;
    const disabled =
      typeof disableDropCursor === "function"
        ? disableDropCursor(this.editorView, pos, event)
        : disableDropCursor;

    if (pos && !disabled) {
      let target: number | null = pos.pos;
      const currSelection = this.editorView.state.selection;
      const slice = this.editorView.state.doc.slice(
        currSelection.from,
        currSelection.to
      );
      if (slice) {
        const point = dropPoint(this.editorView.state.doc, target, slice);
        if (point) target = point;
      }
      this.setCursor(target);
      this.scheduleRemoval(5000);
    }
  }

  dragend() {
    this.scheduleRemoval(20);
  }

  drop(event: DragEvent) {
    const $pos = this.editorView.state.doc.resolve(this.cursorPos!);
    const nodeAfter = $pos.nodeAfter;
    const nodeBefore = $pos.nodeBefore;
    // const dragging = this.editorView.dragging;
    const dragging = true;
    const currSelection = this.editorView.state.selection;
    // console.log({ nodeAfter, nodeBefore, $pos, currSelection });
    if ((nodeAfter || nodeBefore) && dragging && currSelection) {
      // const slice = dragging.slice;
      const slice = this.editorView.state.doc.slice(
        currSelection.from,
        currSelection.to
      );
      const insertPos = this.cursorPos;

      if (!slice || !insertPos) return;
      event.preventDefault();

      const tr = this.editorView.state.tr;
      // if (dragging.move) tr.deleteSelection();
      tr.deleteSelection();

      const pos = tr.mapping.map(insertPos);
      const isNode =
        slice.openStart === 0 &&
        slice.openEnd === 0 &&
        slice.content.childCount === 1;
      const beforeInsert = tr.doc;

      if (isNode) tr.replaceRangeWith(pos, pos, slice.content.firstChild!);
      else tr.replaceRange(pos, pos, slice);
      if (tr.doc.eq(beforeInsert)) return;

      const resolvePos = tr.doc.resolve(pos);
      if (
        isNode &&
        NodeSelection.isSelectable(slice.content.firstChild!) &&
        resolvePos.nodeAfter &&
        resolvePos.nodeAfter.sameMarkup(slice.content.firstChild!)
      ) {
        tr.setSelection(new NodeSelection(resolvePos));
      } else {
        let end = tr.mapping.map(insertPos);
        tr.mapping.maps[tr.mapping.maps.length - 1].forEach(
          (_from, _to, _newFrom, newTo) => (end = newTo)
        );
        tr.setSelection(
          selectionBetween(this.editorView, resolvePos, tr.doc.resolve(end))
        );
      }
      this.editorView.focus();
      this.editorView.dispatch(tr.setMeta("uiEvent", "drop"));
    }
    this.scheduleRemoval(20);
  }

  dragleave(event: DragEvent) {
    if (
      event.target === this.editorView.dom ||
      !this.editorView.dom.contains((event as any).relatedTarget)
    ) {
      this.setCursor(null);
    }
  }
}
