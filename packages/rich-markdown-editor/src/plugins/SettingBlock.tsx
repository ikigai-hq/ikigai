import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { createRoot } from "react-dom/client";
import React from "react";
import { ActionBlockMenu } from "../components/settingBlock/ActionBlockMenu";
import { ExtensionName } from "../types/extensions.enum";
import { findParentNodeClosestToPos } from "prosemirror-utils";

export const SettingBlock = ({
  extensionName,
  tagName,
  className,
}: {
  extensionName: string;
  tagName?: string;
  className?: string;
}): Plugin => {
  const targetTag = className ? `${tagName}.${className}` : `${tagName}`;
  return new Plugin({
    state: {
      init(config, instance) {
        return DecorationSet.create(instance.doc, []);
      },
      apply(transaction, decorationSet, oldState, state) {
        const action = transaction.getMeta(targetTag);
        if (!action && !transaction.docChanged) return decorationSet;
        decorationSet = decorationSet?.map(
          transaction.mapping,
          transaction.doc
        );

        switch (action?.event) {
          case "mouseover": {
            const result = findParentNodeClosestToPos(
              state.doc.resolve(action.pos),
              (node) => node.type.name === extensionName
            );

            if (!result) return decorationSet;
            const { pos, node } = result;
            const addedPos = pos + node.nodeSize - 1;

            const bindActionDiv = document.createElement("div");
            bindActionDiv.className = "action-block-menu";
            bindActionDiv.style.position = "absolute";
            bindActionDiv.style.cursor = "pointer";
            bindActionDiv.style.boxShadow =
              "0px 2px 4px 0px rgba(0, 0, 0, 0.02), 0px 1px 6px -1px rgba(0, 0, 0, 0.02), 0px 1px 2px 0px rgba(0, 0, 0, 0.03);";
            bindActionDiv.style.top = `${
              extensionName === ExtensionName.Paragraph ? action.domRect.top : 0
            }px`;
            bindActionDiv.style.right = "0px";

            createRoot(bindActionDiv).render(
              <ActionBlockMenu pos={addedPos} />
            );

            return decorationSet.add(transaction.doc, [
              Decoration.widget(
                addedPos,
                (view, getPos) => {
                  bindActionDiv.id = `${getPos()}-action-btn`;
                  return bindActionDiv;
                },
                { id: addedPos }
              ),
            ]);
          }
          case "mouseout": {
            const result = findParentNodeClosestToPos(
              state.doc.resolve(action.pos),
              (node) => node.type.name === extensionName
            );

            if (!result) return decorationSet;
            const { pos, node } = result;
            const addedPos = pos + node.nodeSize - 1;

            return decorationSet.remove(
              decorationSet.find(
                undefined,
                undefined,
                (spec) => spec.id === addedPos
              )
            );
          }
          case "trigger-open-setting": {
            if (!action?.isHighlight) {
              const result = findParentNodeClosestToPos(
                state.doc.resolve(action.pos),
                (node) => node.type.name === extensionName
              );
              if (!result) return decorationSet;

              const { pos, node } = result;
              const addedPos = pos + node.nodeSize - 1;
              const foundHighlightDeco = decorationSet.find(
                undefined,
                undefined,
                (spec) => spec.id === "highlight"
              );
              const foundActionMenuWidget = decorationSet.find(
                undefined,
                undefined,
                (spec) => spec.id === addedPos
              );

              return decorationSet.remove([
                ...foundActionMenuWidget,
                ...foundHighlightDeco,
              ]);
            }

            const result = findParentNodeClosestToPos(
              state.doc.resolve(action.pos),
              (node) => node.type.name === extensionName
            );
            if (!result) return decorationSet;

            const { pos, node } = result;
            const isParagraph = node.type.name === ExtensionName.Paragraph;
            return decorationSet.add(transaction.doc, [
              Decoration.node(
                pos,
                pos + node.nodeSize,
                {
                  class: "highlightBlock",
                  style: isParagraph ? `background-color:#E6F4FF99` : "",
                },
                { id: "highlight" }
              ),
            ]);
          }
          default:
        }

        const existingBlockMenuAction = document.querySelector(
          "div.action-block-menu"
        );
        const menuActionId = existingBlockMenuAction?.id.match(/\d+/);

        return menuActionId
          ? decorationSet.remove(
              decorationSet.find(
                undefined,
                undefined,
                (spec) => spec.id === parseInt(menuActionId[0])
              )
            )
          : decorationSet;
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
      handleDOMEvents: {
        focusin: (view, event) => {
          const { dispatch, state } = view;
          const target = event.target as HTMLElement;

          const actionBlockMenuNode = target?.closest(`div.action-block-menu`);
          if (!actionBlockMenuNode) return false;

          const parentTargetNode = actionBlockMenuNode?.closest(targetTag);
          if (!parentTargetNode) return false;

          if (!view.dom.contains(parentTargetNode)) return false;
          const pos = view.posAtDOM(parentTargetNode, 0);
          if (!pos) return false;

          dispatch(
            state.tr.setMeta(targetTag, {
              event: "trigger-open-setting",
              pos,
              isHighlight: true,
            })
          );

          return false;
        },
        focusout: (view, event) => {
          const { dispatch, state } = view;
          const target = event.target as HTMLElement;

          const actionBlockMenuNode = target?.closest(`div.action-block-menu`);
          if (!actionBlockMenuNode) return false;

          const parentTargetNode = actionBlockMenuNode?.closest(targetTag);
          if (!parentTargetNode) return false;

          if (!view.dom.contains(parentTargetNode)) return false;
          const pos = view.posAtDOM(parentTargetNode, 0);
          if (!pos) return false;

          dispatch(
            state.tr.setMeta(targetTag, {
              event: "trigger-open-setting",
              pos,
              isHighlight: false,
            })
          );

          return false;
        },
        mouseover: (view, event) => {
          const isOpeningBlockMenu =
            document.getElementById("BLOCK_MENU")?.childNodes.length;
          if (isOpeningBlockMenu) return false;

          const { dispatch, state, dom } = view;
          const target = event.target as HTMLElement;
          const closestNode = target?.closest(targetTag);
          const existingActionBtn =
            dom.getElementsByClassName("action-block-menu");
          if (existingActionBtn?.length) return false;

          if (!closestNode) return false;
          if (!view.dom.contains(closestNode)) return false;

          const pos = view.posAtDOM(closestNode, 0);
          if (!pos) return false;

          const isParagraphType = extensionName === ExtensionName.Paragraph;
          let canAddActionBtn = true;

          if (isParagraphType) {
            const parentEl = closestNode.parentElement;
            canAddActionBtn = !!parentEl?.className.includes("ProseMirror");
          }

          if (canAddActionBtn) {
            const domRect = closestNode?.getBoundingClientRect();
            const editorRect =
              closestNode?.parentElement?.getBoundingClientRect();
            dispatch(
              state.tr.setMeta(targetTag, {
                event: "mouseover",
                pos,
                domRect:
                  isParagraphType && editorRect
                    ? {
                        ...domRect,
                        top:
                          domRect.y -
                          editorRect.y +
                          domRect.height / 2 -
                          32 / 2, // height of button
                      }
                    : domRect,
              })
            );
          }

          return false;
        },
        mouseout: (view, event) => {
          const isOpeningBlockMenu =
            document.getElementById("BLOCK_MENU")?.childNodes.length;
          if (isOpeningBlockMenu) return false;

          const { state, dispatch } = view;
          const target = event.target as HTMLElement;
          const closestNode = target?.closest(targetTag);

          if (!closestNode) return false;
          if (!view.dom.contains(closestNode)) return false;
          const pos = view.posAtDOM(closestNode, 0);
          if (!pos) return false;

          const isAlsoInsideTarget = closestNode.matches(":hover");
          const existingActionBtn =
            closestNode.getElementsByClassName("action-block-menu");
          const isOpenDropdown = existingActionBtn?.length
            ? existingActionBtn[0].getAttribute("openingDropdown") === "true"
              ? true
              : false
            : false;

          if (isOpenDropdown) return false;

          if (isAlsoInsideTarget) return false;

          const isParagraphType = extensionName === ExtensionName.Paragraph;
          let canAddActionBtn = true;

          if (isParagraphType) {
            const parentEl = closestNode.parentElement;
            canAddActionBtn = !!parentEl?.className.includes("ProseMirror");
          }

          if (canAddActionBtn)
            dispatch(
              state.tr.setMeta(targetTag, {
                event: "mouseout",
                pos,
              })
            );

          return false;
        },
      },
    },
  });
};
