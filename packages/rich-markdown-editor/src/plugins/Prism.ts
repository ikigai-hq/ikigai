import refractor from "refractor/core";
import flattenDeep from "lodash/flattenDeep";
import { Plugin, PluginKey, Transaction } from "prosemirror-state";
import { Node } from "prosemirror-model";
import { Decoration, DecorationSet } from "prosemirror-view";
import { findBlockNodes, findParentNodeClosestToPos } from "prosemirror-utils";

export const LANGUAGES = {
  none: "None", // additional entry to disable highlighting
  bash: "Bash",
  css: "CSS",
  clike: "C",
  csharp: "C#",
  go: "Go",
  markup: "HTML",
  objectivec: "Objective-C",
  java: "Java",
  javascript: "JavaScript",
  json: "JSON",
  perl: "Perl",
  php: "PHP",
  powershell: "Powershell",
  python: "Python",
  ruby: "Ruby",
  rust: "Rust",
  sql: "SQL",
  typescript: "TypeScript",
  yaml: "YAML",
};

type ParsedNode = {
  text: string;
  classes: string[];
};

const cache: Record<number, { node: Node; decorations: Decoration[] }> = {};

function getDecorations({ doc, name }: { doc: Node; name: string }) {
  const decorations: Decoration[] = [];
  const blocks: { node: Node; pos: number }[] = findBlockNodes(doc).filter(
    (item) => item.node.type.name === name
  );

  function parseNodes(
    nodes: refractor.RefractorNode[],
    classNames: string[] = []
  ): any {
    return nodes.map((node) => {
      if (node.type === "element") {
        const classes = [...classNames, ...(node.properties.className || [])];
        return parseNodes(node.children, classes);
      }

      return {
        text: node.value,
        classes: classNames,
      };
    });
  }

  blocks.forEach((block) => {
    let startPos = block.pos + 1;
    const language = block.node.attrs.language;
    if (!language || language === "none" || !refractor.registered(language)) {
      return;
    }

    if (!cache[block.pos] || !cache[block.pos].node.eq(block.node)) {
      const nodes = refractor.highlight(block.node.textContent, language);
      const _decorations = flattenDeep(parseNodes(nodes))
        .map((node: ParsedNode) => {
          const from = startPos;
          const to = from + node.text.length;

          startPos = to;

          return {
            ...node,
            from,
            to,
          };
        })
        .filter((node) => node.classes && node.classes.length)
        .map((node) =>
          Decoration.inline(node.from, node.to, {
            class: node.classes.join(" "),
          })
        );

      cache[block.pos] = {
        node: block.node,
        decorations: _decorations,
      };
    }
    cache[block.pos].decorations.forEach((decoration) => {
      decorations.push(decoration);
    });
  });

  Object.keys(cache)
    .filter((pos) => !blocks.find((block) => block.pos === Number(pos)))
    .forEach((pos) => {
      delete cache[Number(pos)];
    });

  return DecorationSet.create(doc, decorations);
}

export default function Prism({ name }) {
  let highlighted = false;

  return new Plugin({
    key: new PluginKey("prism"),
    state: {
      init: (_: Plugin, { doc }) => {
        return DecorationSet.create(doc, []);
      },
      apply: (transaction: Transaction, decorationSet, oldState, state) => {
        const action = transaction.getMeta("div.code-block");
        const nodeName = state.selection.$head.parent.type.name;
        const previousNodeName = oldState.selection.$head.parent.type.name;
        const codeBlockChanged =
          transaction.docChanged && [nodeName, previousNodeName].includes(name);
        const ySyncEdit = !!transaction.getMeta("y-sync$");

        if (!highlighted || codeBlockChanged || ySyncEdit) {
          highlighted = true;
          return getDecorations({ doc: transaction.doc, name });
        }

        if (!action && !transaction.docChanged) return decorationSet;

        decorationSet = decorationSet?.map(
          transaction.mapping,
          transaction.doc
        );

        switch (action?.event) {
          case "mouseover":
            const result = findParentNodeClosestToPos(
              state.doc.resolve(action.pos),
              (node) => node.type.name === "code_block"
            );

            if (!result) return decorationSet;

            return decorationSet.add(transaction.doc, [
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
          default:
        }

        return decorationSet;
      },
    },
    view: (view) => {
      if (!highlighted) {
        // we don't highlight code blocks on the first render as part of mounting
        // as it's expensive (relative to the rest of the document). Instead let
        // it render un-highlighted and then trigger a defered render of Prism
        // by updating the plugins metadata
        setTimeout(() => {
          view.dispatch(view.state.tr.setMeta("prism", { loaded: true }));
        }, 10);
      }
      return {};
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
      handleDOMEvents: {
        mouseover: (view, event) => {
          const { state, dispatch } = view;
          const target = event.target as HTMLElement;
          const closestNode = target?.closest("div.code-block");

          if (!closestNode) return false;

          if (!view.dom.contains(closestNode)) return false;

          const pos = view.posAtDOM(closestNode, 0);
          if (!pos) return false;

          dispatch(
            state.tr.setMeta("div.code-block", {
              event: "mouseover",
              pos,
            })
          );
          return false;
        },
        mouseout: (view, event) => {
          const { state, dispatch } = view;
          const target = event.target as HTMLElement;
          const closestNode = target?.closest("div.code-block");

          if (!closestNode) return false;

          if (!view.dom.contains(closestNode)) return false;

          const pos = view.posAtDOM(closestNode, 0);

          if (!pos) return false;

          dispatch(
            state.tr.setMeta("div.code-block", {
              event: "mouseout",
              pos,
            })
          );
          return false;
        },
      },
    },
  });
}
