import { findBlockNodes, NodeWithPos } from "prosemirror-utils";
import { Node } from "prosemirror-model";

export default function findCollapsedNodes(doc: Node): NodeWithPos[] {
  const blocks = findBlockNodes(doc);
  const nodes: NodeWithPos[] = [];

  let withinCollapsedHeading;

  for (const block of blocks) {
    if (block.node.type.name === "heading") {
      if (
        !withinCollapsedHeading ||
        block.node.attrs.level <= withinCollapsedHeading
      ) {
        if (block.node.attrs.collapsed) {
          if (!withinCollapsedHeading) {
            withinCollapsedHeading = block.node.attrs.level;
          }
        } else {
          withinCollapsedHeading = undefined;
        }
        continue;
      }
    }

    if (withinCollapsedHeading) {
      nodes.push(block);
    }
  }

  return nodes;
}
