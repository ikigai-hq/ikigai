import { Node } from "@openexam/editor";
import { NodeType, Node as ProseMirrorNode } from "prosemirror-model";
import { NodeComponentOptions } from "@openexam/editor/dist/lib/ComponentView";
import { InputRule } from "prosemirror-inputrules";
import Token from "markdown-it/lib/token";
import { ApolloProvider } from "@apollo/client";
import { getApolloClient } from "graphql/ApolloClient";
import { EditorState, Transaction } from "prosemirror-state";
import { CommonEmbedNodeAttrs } from "./type";
import { CommonEmbedBlock } from "./CommonEmbedBlock";
import { MarkdownSerializerState } from "prosemirror-markdown";
import { WrapComponent } from "../../WrapComponent";

export const COMMON_EMBED_BLOCK_NAME = "common_embed_block";

export class CommonEmbedNode extends Node {
  get name() {
    return COMMON_EMBED_BLOCK_NAME;
  }

  get schema() {
    return {
      attrs: {
        href: {
          default: "",
        },
        canBeRenderedIframe: {
          default: true,
        },
      },
      content: "text*",
      group: "block",
      defining: true,
      selectable: true,
      draggable: true,
      parseDOM: [
        {
          tag: `div.${COMMON_EMBED_BLOCK_NAME}`,
          getAttrs: (dom: HTMLDivElement) => {
            return {
              href: dom.getAttribute("href"),
              canBeRenderedIframe: dom.getAttribute("canBeRenderedIframe"),
            };
          },
        },
      ],
      toDOM: (node: any) => {
        return [
          "div",
          {
            class: COMMON_EMBED_BLOCK_NAME,
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
    newAttrs: CommonEmbedNodeAttrs
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

  // handleDelete = (node: ProseMirrorNode, position: number) => {
  //   const {
  //     view: { state, dispatch },
  //   } = this.editor;

  //   if (Number.isNaN(position)) return;
  //   const startPos = position;
  //   const endPos = position + node.content.size + 2;
  //   dispatch(state.tr.delete(startPos, endPos).scrollIntoView());

  //   this.editor.view.focus();
  // };

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write(`[[[${node.attrs.href}\n`);
    state.text(`${node.attrs.canBeRenderedIframe};`, false);
    state.ensureNewLine();
    state.write("[[[");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: COMMON_EMBED_BLOCK_NAME,
      noCloseToken: true,
      getAttrs: (tok: Token) => {
        const href = tok.info;
        const [canBeRenderedIframe] = tok.content.split(";");
        return { href, canBeRenderedIframe };
      },
    };
  }

  inputRules({ type }: { type: NodeType }) {
    const matchedRule = new RegExp(/{em/);
    return [
      new InputRule(matchedRule, (state, match, start, end) => {
        const [okay] = match;
        const { tr } = state;

        if (okay) {
          tr.replaceRangeWith(start, end, type.create());
        }

        return tr;
      }),
    ];
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

  component = (options: NodeComponentOptions) => {
    const { node, getPos } = options;

    return (
      <WrapComponent>
        <CommonEmbedBlock
          attrs={node.attrs}
          onDelete={() => this.handleDelete(node, getPos())}
        />
      </WrapComponent>
    );
  };
}
