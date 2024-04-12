import { Transaction, EditorState, Plugin } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view";
import { findParentNodeClosestToPos } from "prosemirror-utils";

export const dndPlugin = (
  tagName: string,
  nodeName: string
): Plugin<DecorationSet<any>, any>[] => {
  return [
    new Plugin({
      state: {
        init() {
          return DecorationSet.empty;
        },
        apply: (
          tr: Transaction,
          set: DecorationSet,
          oldState: EditorState,
          newState: EditorState
        ) => {
          const action = tr.getMeta(tagName);
          if (!action && !tr.docChanged) return set;

          // Adjust decoration positions to changes made by the transaction
          set = set.map(tr.mapping, tr.doc);

          switch (action?.event) {
            case "mouseover": {
              const result = findParentNodeClosestToPos(
                newState.doc.resolve(action.pos),
                (node) => node.type.name === nodeName
              );

              if (!result) return set;

              return set.add(tr.doc, [
                Decoration.node(
                  result.pos,
                  result.pos + result.node.nodeSize,
                  {
                    class: `hovering`,
                  },
                  {
                    hover: true,
                  }
                ),
                Decoration.node(result.pos, result.pos + result.node.nodeSize, {
                  class: "counter",
                }),
              ]);
            }
            case "mouseout": {
              const result = findParentNodeClosestToPos(
                newState.doc.resolve(action.pos),
                (node) => node.type.name === nodeName
              );

              if (!result) return set;

              return set.remove(
                set.find(
                  result.pos,
                  result.pos + result.node.nodeSize,
                  (spec) => spec.hover
                )
              );
            }
            default:
          }

          return set;
        },
      },
      props: {
        decorations(state) {
          return this.getState(state);
        },
        handleDOMEvents: {
          mouseover: (view, event) => {
            const { state, dispatch } = view;
            const target = event.target as HTMLElement;
            const closestNode = target?.closest(tagName);

            if (!closestNode) return false;

            if (!view.dom.contains(closestNode)) return false;

            const pos = view.posAtDOM(closestNode, 0);
            if (!pos) return false;

            dispatch(
              state.tr.setMeta(tagName, {
                event: "mouseover",
                pos,
              })
            );
            return false;
          },
          mouseout: (view, event) => {
            const { state, dispatch } = view;
            const target = event.target as HTMLElement;
            const closestNode = target?.closest(tagName);

            if (!closestNode) return false;

            if (!view.dom.contains(closestNode)) return false;

            const pos = view.posAtDOM(closestNode, 0);
            if (!pos) return false;

            dispatch(
              state.tr.setMeta(tagName, {
                event: "mouseout",
                pos,
              })
            );
            return false;
          },
        },
      },
    }),
  ];
};
