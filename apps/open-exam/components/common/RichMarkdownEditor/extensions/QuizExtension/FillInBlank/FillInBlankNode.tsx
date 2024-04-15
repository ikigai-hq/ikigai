import Node from "@openexam/editor/dist/nodes/Node";
import { NodeType, Node as ProseMirrorNode } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import { EditorState, Transaction } from "prosemirror-state";
import { NodeComponentOptions } from "@openexam/editor/dist/lib/ComponentView";
import { v4 } from "uuid";

import Token from "markdown-it/lib/token";
import { MarkdownSerializerState } from "prosemirror-markdown";
import FillInBlankBlock from "./FillInBlankBlock";
import { SliceNode } from "../type";
import { flatMapDeep } from "lodash";
import { selectAndCopyNode } from "../../../BlockComponents/util";
import { WrapComponent } from "components/common/RichMarkdownEditor/WrapComponent";

export const FILL_IN_BLANK_NAME = "fill_in_blank";

export default class FillInBlankNode extends Node {
  get name(): string {
    return FILL_IN_BLANK_NAME;
  }

  get schema() {
    return {
      attrs: {
        quizId: {
          default: "00000000-0000-0000-0000-000000000000",
        },
        initialValue: {
          default: "",
        },
      },
      inline: true,
      group: "inline",
      selectable: true,
      parseDOM: [
        {
          tag: `span.${FILL_IN_BLANK_NAME}`,
          getAttrs: (dom: HTMLSpanElement) => {
            return {
              quizId: dom.getAttribute("quizid"),
            };
          },
        },
      ],
      toDOM: (node: ProseMirrorNode) => {
        return ["span", { class: FILL_IN_BLANK_NAME, ...node.attrs }];
      },
    };
  }

  inputRules({ type }: { type: NodeType }) {
    const matchedRule = new RegExp(/{bl/);
    return [
      new InputRule(matchedRule, (state, match, start, end) => {
        const [okay] = match;
        const { tr } = state;

        if (okay) {
          tr.replaceWith(
            start,
            end,
            type.create({
              quizId: v4().toString(),
            })
          );
        }

        return tr;
      }),
    ];
  }

  commands(options: { type: NodeType }) {
    return (attrs: { [key: string]: unknown }) =>
      (state: EditorState, dispatch: (tr: Transaction) => void) => {
        const contents = state.selection
          .content()
          .content.toJSON() as SliceNode[];

        const getNestedContents = (item: SliceNode) => {
          if (!item.content || !item.content.length) {
            return item;
          }
          return [item, flatMapDeep(item.content, getNestedContents)];
        };

        const flattenContents = flatMapDeep(contents, getNestedContents);

        const foundedTextNode = flattenContents
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join(" ");

        const finalAttrs = { ...attrs };

        if (!finalAttrs.quizId) {
          finalAttrs.quizId = v4().toString();
          finalAttrs.initialValue = foundedTextNode;
        }

        const node = options.type.create({ ...finalAttrs });

        const transaction = state.tr.replaceSelectionWith(node);

        dispatch(transaction.scrollIntoView());

        return true;
      };
  }

  onDelete(node: ProseMirrorNode, position: number) {
    const {
      view: { state, dispatch },
    } = this.editor;

    if (Number.isNaN(position)) return;
    const startPos = position;
    const endPos = position + node.content.size + 2;
    dispatch(state.tr.delete(startPos, endPos).scrollIntoView());

    this.editor.view.focus();
  }

  handleAttributesChange = (
    node: ProseMirrorNode,
    position: number,
    newAttrs: { [key: string]: any }
  ) => {
    const { view } = this.editor;
    const { tr } = view.state;

    if (Number.isNaN(position)) return;
    try {
      const transaction = tr.setNodeMarkup(position, node.type, {
        ...node.attrs,
        ...newAttrs,
      });
      view.dispatch(transaction);
    } catch (e) {
      // TODO: Should use segment to track this instead of sentry
      console.log("Cannot apply transaction in FillInBlank Node", e);
    }
  };

  parseMarkdown() {
    return {
      block: FILL_IN_BLANK_NAME,
      getAttrs: (tok: Token) => {
        return { quizId: tok.info || null };
      },
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    const content = `{bl%${node.attrs.quizId}%lb}`;
    state.write(content);
  }

  component = (options: NodeComponentOptions) => {
    const { node, getPos, componentView, isSelected } = options;

    const onBlockDelete = () => {
      this.onDelete(node, getPos());
    };

    const onCloneComplete = () => {
      this.handleAttributesChange(node, getPos(), {
        originalQuizId: undefined,
      });
    };

    const onSelect = () => {
      selectAndCopyNode(options, this.editor);
    };

    return (
      <WrapComponent>
        <FillInBlankBlock
          documentId={this.editor.props.documentId}
          quizId={node.attrs.quizId}
          initialValue={node.attrs.initialValue}
          onDelete={onBlockDelete}
          view={componentView.view}
          originalQuizId={node.attrs.originalQuizId}
          onCloneComplete={onCloneComplete}
          onSelect={onSelect}
          isSelected={isSelected}
        />
      </WrapComponent>
    );
  };
}
