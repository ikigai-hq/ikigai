import Node from "@ikigai/editor/dist/nodes/Node";
import { NodeType, Node as ProseMirrorNode } from "prosemirror-model";
import { NodeComponentOptions } from "@ikigai/editor/dist/lib/ComponentView";
import { InputRule } from "prosemirror-inputrules";
import Token from "markdown-it/lib/token";
import { RecordBlockAttrs } from "./type";
import { EditorState, Transaction } from "prosemirror-state";
import dynamic from "next/dynamic";
import { WrapComponent } from "../../WrapComponent";
import { FORCE_UPDATE_KEY } from "@ikigai/editor/dist/constant/metaKey";

const RecordBlock = dynamic(() => import("./RecordBlock"), {
  ssr: false,
});

export abstract class RecordNode extends Node {
  abstract get name(): string;

  abstract get inputKey(): RegExp;

  get schema() {
    return {
      attrs: {
        fileId: {
          default: "00000000-0000-0000-0000-000000000000",
        },
        name: {
          default: "Record Name",
        },
        contentType: {
          default: "",
        },
        publicUrl: {
          default: "",
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
              fileId: dom.getAttribute("fileid"),
              name: dom.getAttribute("name"),
              contentType: dom.getAttribute("contenttype"),
              publicUrl: dom.getAttribute("publicurl"),
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
    newAttrs: RecordBlockAttrs,
  ) => {
    const { view } = this.editor;
    const { tr } = view.state;

    if (Number.isNaN(position)) return;
    const transaction = tr.setNodeMarkup(position, node.type, {
      ...node.attrs,
      ...newAttrs,
    });
    // WARNING: This is a trick to force editor force update the content
    // in readonly mode.
    // Don't re-use it if you don't understand.
    transaction.setMeta(FORCE_UPDATE_KEY, true);
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
        const fileId = tok.info;
        const [_, name, contentType, publicUrl] = tok.content.split(";");
        return { fileId, name, contentType, publicUrl };
      },
    };
  }

  inputRules({ type }: { type: NodeType }) {
    const matchedRule = this.inputKey;
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

  renderComponent = (
    recordType: "audio" | "video",
    options: NodeComponentOptions,
  ) => {
    const { node, getPos, componentView } = options;

    const onChangeAttrs = (newAttrs: RecordBlockAttrs) => {
      const { view } = componentView;
      const shouldEnableEditable = !view.editable;
      // NOTE: This is a magic that allow user can change the editor.
      // In the future, we should use backend flow instead.
      if (shouldEnableEditable) {
        view.setProps({ editable: () => true });
      }

      const position = getPos();
      this.handleAttributesChange(node, position, newAttrs);

      if (shouldEnableEditable) {
        view.setProps({ editable: () => false });
      }
    };

    return (
      <WrapComponent>
        <RecordBlock
          documentId={this.editor.props.documentId}
          attrs={node.attrs}
          onChangeAttrs={onChangeAttrs}
          handleDelete={() => this.handleDelete(node, getPos())}
          recordType={recordType}
        />
      </WrapComponent>
    );
  };
}
