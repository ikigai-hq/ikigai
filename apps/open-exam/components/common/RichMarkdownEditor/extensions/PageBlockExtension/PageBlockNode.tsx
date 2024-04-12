import Node from "@zkls/editor/dist/nodes/Node";
import { NodeType, Node as ProseMirrorNode } from "prosemirror-model";
import { NodeComponentOptions } from "@zkls/editor/dist/lib/ComponentView";
import { MarkdownSerializerState } from "prosemirror-markdown";
import { InputRule } from "prosemirror-inputrules";
import Token from "markdown-it/lib/token";
import { EditorState, Transaction } from "prosemirror-state";
import { WrapComponent } from "../../WrapComponent";
import { PageBlock } from "./PageBlock";
import { PageBlockAttrs } from "./type";
import { selectAndCopyNode } from "../../BlockComponents/util";

export const PAGE_BLOCK_NAME = "page_block";

export class PageBlockNode extends Node {
  get name() {
    return PAGE_BLOCK_NAME;
  }

  get schema() {
    return {
      attrs: {
        pageBlockId: {
          default: "00000000-0000-0000-0000-000000000000",
        },
        pageBlockTitle: {
          default: "Page Block Name",
        },
        type: {
          default: "split",
        },
      },
      content: "text*",
      group: "block",
      defining: true,
      selectable: false,
      draggable: true,
      parseDOM: [
        {
          tag: `div.${this.name}`,
          getAttrs: (dom: HTMLDivElement) => {
            return {
              pageBlockId: dom.getAttribute("pageBlockId"),
              name: dom.getAttribute("pageBlockId"),
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

  parseMarkdown() {
    return {
      block: this.name,
      noCloseToken: true,
      getAttrs: (tok: Token) => {
        try {
          const content = JSON.parse(tok.content);
          return {
            pageBlockId: tok.info,
            pageBlockTitle: content?.pageBlockTitle,
            type: content?.type || "split",
          };
        } catch (error) {
          console.error("Error when parse data from page block.");
        }
      },
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write(`(((${node.attrs.pageBlockId}\n`);
    state.text(
      JSON.stringify({
        pageBlockTitle: node.attrs.pageBlockTitle,
        type: node.attrs.type,
      }),
      false,
    );
    state.ensureNewLine();
    state.write(`(((`);
    state.closeBlock(node);
  }

  get inputKey(): RegExp {
    return new RegExp(/{pb/);
  }

  inputRules({ type }: { type: NodeType }) {
    const matchedRule = new RegExp(/{pb/);
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

  handleAttributesChange = (
    node: ProseMirrorNode,
    position: number,
    newAttrs: PageBlockAttrs,
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

  component = (options: NodeComponentOptions) => {
    const { node, getPos, componentView, isSelected } = options;
    const documentId = this.editor.props.documentId;

    const onChangeAttrs = (newAttrs: PageBlockAttrs) => {
      const position = getPos();
      this.handleAttributesChange(node, position, newAttrs);
    };

    const onSelectNode = () => {
      selectAndCopyNode(options, this.editor);
    };

    return (
      <WrapComponent>
        <PageBlock
          attrs={node.attrs}
          documentId={documentId}
          onChangeAttrs={onChangeAttrs}
          handleDelete={() => this.handleDelete(node, getPos())}
          handleSelectAndCopy={onSelectNode}
        />
      </WrapComponent>
    );
  };
}
