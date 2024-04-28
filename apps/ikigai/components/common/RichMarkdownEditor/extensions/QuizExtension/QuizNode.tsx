import Node from "@ikigai/editor/dist/nodes/Node";
import { NodeType, Node as ProseMirrorNode } from "prosemirror-model";
import { NodeComponentOptions } from "@ikigai/editor/dist/lib/ComponentView";
import { InputRule } from "prosemirror-inputrules";
import Token from "markdown-it/lib/token";
import { EditorState, Transaction } from "prosemirror-state";

import { QuizAttrs } from "./type";
import { MarkdownSerializerState } from "prosemirror-markdown";
import QuizBlock from "./QuizBlock";
import { selectAndCopyNode } from "../../BlockComponents/util";
import { WrapComponent } from "../../WrapComponent";

export const QUIZ_BLOCK_NAME = "quiz_block";

export class QuizNode extends Node {
  get name() {
    return QUIZ_BLOCK_NAME;
  }

  get schema() {
    return {
      attrs: {
        quizId: {
          default: "00000000-0000-0000-0000-000000000000",
        },
        quizTitle: {
          default: "",
        },
        quizzType: {
          default: "",
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
              quizId: dom.getAttribute("quizid"),
              quizTitle: dom.getAttribute("quizTitle"),
              quizzType: dom.getAttribute("quizzType"),
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
    newAttrs: QuizAttrs,
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
          const { quizTitle, quizzType } = JSON.parse(tok.content);
          return {
            quizId: tok.info,
            quizTitle,
            quizzType,
          };
        } catch (error) {
          return { quizId: tok.info, quizTitle: tok.content };
        }
      },
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    const content = `&&&${node.attrs.quizId}\n`;
    state.write(content);
    state.text(
      JSON.stringify({
        quizTitle: node.attrs.quizTitle,
        quizzType: node.attrs.quizzType,
      }),
      false,
    );
    state.ensureNewLine();
    state.write("&&&");
    state.closeBlock(node);
  }

  inputRules({ type }: { type: NodeType }) {
    const matchedRule = new RegExp(/{q/);
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

  component = (options: NodeComponentOptions) => {
    const { node, getPos, componentView, isSelected } = options;

    const onChangeAttrs = (newAttrs: QuizAttrs) => {
      const position = getPos();
      this.handleAttributesChange(node, position, newAttrs);
    };

    const onSelectNode = () => {
      selectAndCopyNode(options, this.editor);
    };

    return (
      <WrapComponent>
        <QuizBlock
          documentId={this.editor.props.documentId}
          view={componentView?.view}
          attrs={node.attrs}
          onChangeAttrs={onChangeAttrs}
          handleDelete={() => this.handleDelete(node, getPos())}
          handleSelectAndCopy={onSelectNode}
          isSelected={isSelected}
        />
      </WrapComponent>
    );
  };
}
