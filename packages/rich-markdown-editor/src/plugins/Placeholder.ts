import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import Extension from "../lib/Extension";

export default class Placeholder extends Extension {
  get name() {
    return "empty-placeholder";
  }

  get defaultOptions() {
    return {
      emptyNodeClass: "placeholder",
      placeholder: "",
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          // handleDOMEvents: {
          //   mouseover(view, event) {
          //     console.log("mouseOver");
          //     return false;
          //   },
          // },
          decorations: (state) => {
            const { doc } = state;

            const decorations: Decoration[] = [];
            const completelyEmpty =
              doc.textContent === "" &&
              doc.childCount <= 1 &&
              doc.content.size <= 2;
            // doc.childCount <= 5 &&
            // doc.content.size <= 10;

            doc.descendants((node, pos) => {
              if (!completelyEmpty) {
                return;
              }

              if (pos !== 0 || node.type.name !== "paragraph") {
                return;
              }

              const decoration = Decoration.node(pos, pos + node.nodeSize, {
                class: this.options.emptyNodeClass,
                "data-empty-text": pos === 0 ? this.options.placeholder : "",
              });
              decorations.push(decoration);
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  }
}
