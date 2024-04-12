import Node from "@zkls/editor/dist/nodes/Node";
import { NodeType, Node as ProseMirrorNode } from "prosemirror-model";
import { NodeComponentOptions } from "@zkls/editor/dist/lib/ComponentView";
import { MarkdownSerializerState } from "prosemirror-markdown";
import Token from "markdown-it/lib/token";
import { EditorState, Transaction } from "prosemirror-state";
import { WrapComponent } from "../../WrapComponent";
import { ZenNodeAttrs } from "./type";
import { ZenNodeType } from "@zkls/editor/dist/types/extensions.enum";
import { TableOfContent } from "../TableOfContentExtention";

export class ZenCommonNode extends Node {
  get name() {
    return "common_zenblock";
  }

  get schema() {
    return {
      attrs: {
        nodeId: {
          default: "00000000-0000-0000-0000-000000000000",
        },
        zenNodeType: {
          default: this.options.type,
        },
      },
      content: "text*",
      contentEditable: false,
      group: "block",
      defining: true,
      selectable: true,
      parseDOM: [
        {
          tag: `div.${this.name}`,
          getAttrs: (dom: HTMLDivElement) => {
            return {
              nodeId: dom.getAttribute("nodeId"),
              zenNodeType: dom.getAttribute("zenNodeType"),
            };
          },
        },
      ],
      toDOM: (node: any) => {
        return [
          "div",
          {
            class: this.name,
            ...node.attrs,
          },
          0,
        ];
      },
    };
  }

  handleAttributesChange = (
    node: ProseMirrorNode,
    position: number,
    newAttrs: ZenNodeAttrs,
  ) => {
    const { view } = this.editor;
    const { tr } = view.state;

    if (Number.isNaN(position)) return;
    const transaction = tr.setNodeMarkup(position, node.type, {
      ...node.attrs,
      ...newAttrs,
    });
    view.dispatch(transaction);
  };

  handleDelete = (node: ProseMirrorNode, position: number) => {
    const {
      view: { state, dispatch },
    } = this.editor;

    if (Number.isNaN(position)) return;
    const startPos = position;
    const endPos = position + node.content.size + 2;
    dispatch(state.tr.delete(startPos, endPos).scrollIntoView());

    this.editor.view.focus();
  };

  parseMarkdown() {
    return {
      block: this.name,
      noCloseToken: true,
      getAttrs: (tok: Token) => {
        try {
          const { zenNodeType } = JSON.parse(tok.content);
          return {
            nodeId: tok.info,
            zenNodeType,
          };
        } catch (error) {
          console.error("Can not parse this rule!");
        }
      },
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    const content = `]]]${node.attrs.nodeId}\n`;
    state.write(content);
    state.text(
      JSON.stringify({
        zenNodeType: node.attrs.zenNodeType,
      }),
      false,
    );
    state.ensureNewLine();
    state.write("]]]");
    state.closeBlock(node);
  }

  commands(options: { type: NodeType }) {
    return (attrs: { [key: string]: unknown }) =>
      (state: EditorState, dispatch: (tr: Transaction) => void) => {
        const node = options.type.create({ ...attrs });
        const transaction = state.tr.replaceSelectionWith(node);

        dispatch(transaction.scrollIntoView());
        return true;
      };
  }

  component = (options: NodeComponentOptions) => {
    const { componentView } = options;
    const zenNodeType = options.node?.attrs?.zenNodeType;

    return (
      <WrapComponent>
        {zenNodeType === ZenNodeType.TableOfContent && (
          <TableOfContent
            editorView={componentView?.view}
            getHeadings={componentView?.editor?.getHeadings}
          />
        )}
      </WrapComponent>
    );
  };
}
