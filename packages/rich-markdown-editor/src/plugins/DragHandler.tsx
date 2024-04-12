import {
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
} from "prosemirror-state";
import { selectParentNodeOfType } from "prosemirror-utils";

export const dragHandler = (onOpen: (value: string) => void): Plugin => {
  const dragEl = document.getElementById("dnd");
  const plusBtn = document.getElementById("trigger-slash-menu");

  const hiddenDragIcon = (dragEl: HTMLElement | null) => {
    if (dragEl) dragEl.style.display = "none";
  };

  return new Plugin({
    key: new PluginKey("drag-drop"),
    view: () => {
      return {
        update: () => {
          const activeEditorEl = document.getElementById("active-editor");
          if (activeEditorEl) {
            activeEditorEl.onscroll = () => {
              hiddenDragIcon(dragEl);
            };
            activeEditorEl.onmouseleave = () => {
              hiddenDragIcon(dragEl);
            };
          }
        },
      };
    },
    props: {
      handleDOMEvents: {
        keyup: () => {
          hiddenDragIcon(dragEl);
          return false;
        },
        mouseover: (view, event) => {
          event.preventDefault();
          const { state, dispatch } = view;
          const target = event.target as HTMLElement;

          const findParentEl = (el: HTMLElement): HTMLElement | null => {
            const parentEl = el.parentElement;

            if (el?.nodeName === "UL" || el?.nodeName === "OL") return null;

            if (parentEl) {
              if (parentEl?.nodeName === "UL" || parentEl?.nodeName === "OL") {
                return el;
              }
              if (
                typeof parentEl?.className === "string" &&
                parentEl?.className.includes("ProseMirror") &&
                !parentEl?.className?.includes("icon")
              ) {
                return el;
              }
              return findParentEl(parentEl);
            }

            return null;
          };

          let finalEl: HTMLElement | null = null;

          const isSingleParagraph =
            target.nodeName === "P" &&
            target?.parentElement?.className?.includes("ProseMirror");

          if (isSingleParagraph) {
            finalEl = target;
          } else {
            const foundEl = findParentEl(target);

            if (foundEl?.nodeName === "LI") {
              const currPos = view.posAtDOM(foundEl, 0);
              const resolvedPos = state.doc.resolve(currPos);
              const currPmNode = resolvedPos.parent;
              if (
                !["list_item", "checkbox_item"].includes(currPmNode.type.name)
              )
                return false;

              finalEl = foundEl;
            }

            if (target.nodeName === "P") {
              if (foundEl?.nodeName === "BLOCKQUOTE") {
                finalEl = foundEl;
              }
            }

            if (target.nodeName === foundEl?.nodeName) {
              finalEl = foundEl;
            }
          }

          if (!finalEl) return false;

          if (
            finalEl.nodeName === "DIV" &&
            finalEl?.parentElement?.className?.includes("ProseMirror-widget")
          )
            return false;

          const currPos = view.posAtDOM(finalEl, 0);

          if (!currPos || currPos < 0) return false;

          const resolvedPos = state.doc.resolve(currPos);
          const currPmNode = resolvedPos.parent;

          if (!currPmNode) return false;

          let emptySpace = 45;
          if (finalEl.nodeName === "LI") emptySpace = 65;
          if (
            finalEl.nodeName === "LI" &&
            finalEl.parentElement?.className.includes("checkbox_list")
          )
            emptySpace = 45;

          const coordinates: DOMRect = finalEl.getBoundingClientRect();
          const recalculatePos = currPos === 0 ? 0 : currPos - 1;
          const activeEditorEl = document.getElementById("active-editor");
          const activeEditorElParent =
            activeEditorEl?.offsetParent as HTMLElement;
          const activeEditorElParentCoord =
            activeEditorElParent?.getBoundingClientRect();
          const finalElCoord = finalEl?.getBoundingClientRect();

          const setSelection = (): {
            fromPos: number;
            nextPos: number;
          } => {
            let nextPos: number;
            let fromPos: number;
            if (currPmNode.type.name === "paragraph") {
              const newTransaction = state.tr.setSelection(
                NodeSelection.near(state.doc.resolve(recalculatePos))
              );
              const selectedParentNode = selectParentNodeOfType(
                state.schema.nodes[currPmNode.type.name]
              )(newTransaction);
              dispatch(selectedParentNode);
              nextPos = selectedParentNode.selection.to;
              fromPos = selectedParentNode.selection.from;
            } else {
              const $pos = state.doc.resolve(recalculatePos);
              const transaction = state.tr.setSelection(
                new NodeSelection($pos)
              );
              dispatch(transaction);
              nextPos = transaction.selection.to;
              fromPos = transaction.selection.from;
            }
            return { nextPos, fromPos };
          };

          if (plusBtn) {
            plusBtn.onmousedown = (event) => {
              event.stopPropagation();
              const { nextPos, fromPos } = setSelection();
              const nodeAtPos = view.state.doc.nodeAt(fromPos);
              if (nodeAtPos?.textContent?.length === 0) {
                view.dispatch(
                  view.state.tr.setSelection(
                    TextSelection.near(view.state.doc.resolve(fromPos))
                  )
                );
                onOpen("");
              } else {
                const paragraphNode = state.schema.nodes["paragraph"];
                const transaction = state.tr.insert(
                  nextPos,
                  paragraphNode.create()
                );
                view.dispatch(transaction);
                view.dispatch(
                  view.state.tr.setSelection(
                    TextSelection.near(view.state.doc.resolve(nextPos))
                  )
                );
                const isEmpty =
                  view.state.selection.$from.parent.textContent.length === 0;
                if (isEmpty) onOpen("");
              }
              dragEl && hiddenDragIcon(dragEl);
            };
          }
          if (
            dragEl &&
            activeEditorElParentCoord &&
            coordinates &&
            finalElCoord
          ) {
            const left = finalElCoord.left - activeEditorElParentCoord.left;
            dragEl.style.display = "flex";
            dragEl.style.left = `${left - emptySpace}px`;
            dragEl.style.top = `${
              coordinates.y - activeEditorElParentCoord.y
            }px`;

            dragEl.onmousedown = () => {
              setSelection();
            };

            let ghostEl: HTMLElement;

            dragEl.ondragstart = (event) => {
              const clonedNode = finalEl?.cloneNode(true);
              const id = currPmNode.attrs.id as string;
              const zenBlock = document.getElementById(id);
              const exalidDrawNode =
                zenBlock?.className.includes("ExcalidDraw");
              if (clonedNode && !exalidDrawNode) {
                ghostEl = clonedNode as HTMLElement;
                ghostEl.style.width = "50%";
                document.body.appendChild(ghostEl);
                event.dataTransfer?.setDragImage(ghostEl, 0, 0);
              }
            };

            dragEl.ondragover = () => {
              ghostEl.style.display = "none";
            };

            dragEl.ondragleave = () => {
              hiddenDragIcon(dragEl);
            };

            dragEl.ondragend = () => {
              hiddenDragIcon(dragEl);
              if (ghostEl) {
                document.body.removeChild(ghostEl);
              }
            };
          }

          return false;
        },
      },
    },
  });
};
