/* eslint-disable max-len */
import Node from "@open-assignment/editor/dist/nodes/Node";
import { NodeType, Node as ProseMirrorNode } from "prosemirror-model";
import { NodeComponentOptions } from "@open-assignment/editor/dist/lib/ComponentView";
import { MarkdownSerializerState } from "prosemirror-markdown";
import { InputRule } from "prosemirror-inputrules";
import Token from "markdown-it/lib/token";
import { FileAttrs, FileNodeAttrs } from "./type";
import { EditorState, Transaction } from "prosemirror-state";
import { selectAndCopyNode } from "../../BlockComponents/util";
import { isZeroUUIDString } from "../../utils";
import { DEFAULT_FILE_ID, DEFAULT_SIZE, FILE_BLOCK_NAME } from "./utils";
import { WrapComponent } from "../../WrapComponent";
import { FileExtension } from ".";
import { FORCE_UPDATE_KEY } from "@open-assignment/editor/dist/constant/metaKey";

export class FileBlockNode extends Node {
  get name() {
    return FILE_BLOCK_NAME;
  }

  get schema() {
    return {
      attrs: {
        size: {
          default: {},
        },
        files: {
          default: [],
        },
        fileId: {
          default: DEFAULT_FILE_ID,
        },
        name: {
          default: "",
        },
        contentType: {
          default: "",
        },
        publicUrl: {
          default: "",
        },
        audioSubmissionReplay: {
          default: true,
        },
      },
      content: "text*",
      group: "block",
      defining: true,
      parseDOM: [
        {
          tag: `div.${FILE_BLOCK_NAME}`,
          getAttrs: (dom: HTMLDivElement) => {
            let files = [];
            try {
              files = JSON.parse(dom.getAttribute("files"));
            } catch (e) {
              console.error("Cannot parse files from DOM", e);
            }
            return {
              files,
              fileId: dom.getAttribute("fileid"),
              name: dom.getAttribute("name"),
              contentType: dom.getAttribute("contenttype"),
              publicUrl: dom.getAttribute("publicurl"),
              audioSubmissionReplay: dom.getAttribute("audiosubmissionreplay"),
            };
          },
        },
      ],
      toDOM: (node: any) => {
        return [
          "div",
          {
            class: FILE_BLOCK_NAME,
            ...node.attrs,
            files: JSON.stringify(node.attrs.files),
          },
          0,
        ];
      },
    };
  }

  handleAttributesChange = (
    node: ProseMirrorNode,
    position: number,
    newAttrs: Partial<FileNodeAttrs>,
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

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    const files = node.attrs.files || [];
    const size = node.attrs.size || DEFAULT_SIZE;
    const jsonifyFiles = JSON.stringify(files);
    const jsonifySize = JSON.stringify(size);
    const text = `${node.attrs.name};${node.attrs.contentType};${node.attrs.publicUrl};${jsonifyFiles};${jsonifySize};${node.attrs.audioSubmissionReplay}`;

    state.write(`%%%${files.length ? files[0].fileId : node.attrs.fileId}\n`);
    state.text(text, false);
    state.ensureNewLine();
    state.write("%%%");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: FILE_BLOCK_NAME,
      noCloseToken: true,
      getAttrs: (tok: Token) => {
        const fileId = tok.info;
        const content = tok.content;
        const [
          name,
          contentType,
          publicUrl,
          jsonifyFiles,
          jsonifySize,
          audioSubmissionReplay,
        ] = content.split(";");
        let files = [];
        let size = DEFAULT_SIZE;

        try {
          files = JSON.parse(jsonifyFiles);
          size = JSON.parse(jsonifySize);
        } catch (err) {
          console.error(err);
        }

        return {
          fileId,
          name,
          contentType,
          publicUrl,
          files,
          size,
          audioSubmissionReplay:
            audioSubmissionReplay === undefined
              ? true
              : JSON.parse(audioSubmissionReplay),
        };
      },
    };
  }

  inputRules({ type }: { type: NodeType }) {
    const matchedRule = new RegExp(/{f/);
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

    const onChangeAttrs = (newAttrs: Partial<FileNodeAttrs>) => {
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

    const attrs = node.attrs;
    const files: FileAttrs[] = attrs.files.length ? attrs.files : [];
    if (!files.length && attrs.fileId && !isZeroUUIDString(attrs.fileId)) {
      files.push({
        fileId: attrs.fileId,
        name: attrs.name,
        contentType: attrs.contentType,
        publicUrl: attrs.publicUrl,
      });
    }

    const onSelect = () => {
      selectAndCopyNode(options, this.editor);
    };

    return (
      <WrapComponent>
        <FileExtension
          documentId={this.editor.props.documentId}
          size={attrs.size}
          name={attrs.name}
          audioSubmissionReplay={attrs.audioSubmissionReplay}
          files={files}
          view={componentView?.view}
          onDelete={() => this.handleDelete(node, getPos())}
          onChangeAttrs={onChangeAttrs}
          isSelected={isSelected}
          handleSelect={onSelect}
        />
      </WrapComponent>
    );
  };
}
