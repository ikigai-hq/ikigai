import Node from "@open-assignment/editor/dist/nodes/Node";
import { NodeType, Node as ProseMirrorNode } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import { EditorState, Transaction } from "prosemirror-state";
import { NodeComponentOptions } from "@open-assignment/editor/dist/lib/ComponentView";
import { MarkdownSerializerState } from "prosemirror-markdown";

import Token from "markdown-it/lib/token";
import { FeedbackTextAttrs } from "./index";
import FeedbackTextBlock from "./FeedbackTextBlock";
import { v4 } from "uuid";
import { WrapComponent } from "../../WrapComponent";

export const FEEDBACK_TEXT_NAME = "feedback_text";

export default class FeedbackTextNode extends Node {
  get name(): string {
    return FEEDBACK_TEXT_NAME;
  }

  get schema() {
    return {
      attrs: {
        id: {
          default: "",
        },
        feedback: {
          default: "",
        },
        autoFocus: {
          default: false,
        },
      },
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [
        {
          tag: `span.${FEEDBACK_TEXT_NAME}`,
          getAttrs: (dom: HTMLSpanElement) => {
            return {
              id: dom.getAttribute("id"),
              feedback: dom.getAttribute("feedback"),
            };
          },
        },
      ],
      toDOM: (node: ProseMirrorNode) => {
        return ["span", { class: FEEDBACK_TEXT_NAME, ...node.attrs }];
      },
    };
  }

  keys({ type }: { type: NodeType }) {
    return {
      "Ctrl-d": this.createFeedbackTextWithSelection,
      "Alt-s": this.createFeedbackTextWithSelection,
    };
  }

  createFeedbackTextWithSelection(
    state: EditorState,
    dispatch: (tr: Transaction) => void,
  ) {
    const { from, to } = state.selection;
    if (state.selection.empty) {
      const tr = state.tr.insert(
        to + 1,
        state.schema.nodes.feedback_text.create({
          id: v4(),
          feedback: "",
          autoFocus: true,
        }),
      );
      dispatch(tr);
      return true;
    }

    const tr = state.tr
      .addMark(from, to, state.schema.marks.strikethrough.create())
      .insert(
        to + 1,
        state.schema.nodes.feedback_text.create({
          id: v4(),
          feedback: "",
          autoFocus: true,
        }),
      );
    dispatch(tr);
  }

  inputRules({ type }: { type: NodeType }) {
    const matchedRule = new RegExp(/{rr/);
    return [
      new InputRule(matchedRule, (state, match, start, end) => {
        const [okay] = match;
        const { tr } = state;

        if (okay) {
          tr.replaceWith(
            start,
            end,
            type.create({
              id: v4(),
              feedback: "",
              autoFocus: true,
            }),
          );
        }

        return tr;
      }),
    ];
  }

  commands(options: { type: NodeType }) {
    return () => this.createFeedbackTextWithSelection;
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
    newAttrs: FeedbackTextAttrs,
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

  parseMarkdown() {
    return {
      block: FEEDBACK_TEXT_NAME,
      getAttrs: (tok: Token) => {
        if (tok.info.includes(";#;")) {
          const [id, feedback] = tok.info.split(";#;");
          return {
            id,
            feedback,
          };
        }
        return {
          id: v4(),
          feedback: tok.info || "",
        };
      },
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    const content = `{rr%${node.attrs.id};#;${node.attrs.feedback}%rr}`;
    state.write(content);
  }

  component = (options: NodeComponentOptions) => {
    const { node, getPos, componentView, isEditable } = options;

    const onChangeAttrs = (newAttrs: FeedbackTextAttrs) => {
      const position = getPos();
      this.handleAttributesChange(node, position, newAttrs);
    };

    return (
      <WrapComponent>
        <FeedbackTextBlock
          attrs={node.attrs as FeedbackTextAttrs}
          onChange={onChangeAttrs}
          view={componentView.view}
          readonly={!isEditable}
        />
      </WrapComponent>
    );
  };
}
