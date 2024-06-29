import {
  Editor,
  EditorContent,
  Extensions,
  JSONContent,
  useEditor,
} from "@tiptap/react";
import { useRef } from "react";
import { Fragment, Node } from "prosemirror-model";

import useEditorStore from "store/EditorStore";
import { WRITING_BLOCK_NAME } from "./Extensions/WritingBlock";
import { EMPTY_UUID, isEmptyUuid } from "util/FileUtil";

export const findTransformBlocks = (
  fragment: Fragment | Node,
  nodeName: string,
): Node[] => {
  const blocks = [];
  fragment.forEach((node: Node) => {
    if (node.type.name === nodeName) {
      blocks.push(node);
    }

    blocks.push(...findTransformBlocks(node, nodeName));
  });

  return blocks;
};

export type IkigaiEditorProps = {
  readOnly: boolean;
  onUpdate: (body: JSONContent) => void | Promise<void>;
  onForceSave: (body: JSONContent) => void | Promise<void>;
  extensions: Extensions;
  body?: JSONContent;
};

export const useIkigaiEditor = ({
  readOnly,
  body,
  onUpdate,
  extensions,
  onForceSave,
}: IkigaiEditorProps) => {
  const setActiveEditor = useEditorStore((state) => state.setActiveEditor);
  const innerContent = useRef(body);

  return useEditor({
    editable: !readOnly,
    extensions,
    content: body,
    editorProps: {
      handleDOMEvents: {
        keydown: (_, event) => {
          if (event.key === "s") {
            if (event.metaKey || event.ctrlKey) {
              onForceSave(innerContent.current);
              event.preventDefault();
            }
          }

          return false;
        },
      },
      // This function will handle pasted data.
      transformPasted: (slice) => {
        const writingBlocks = findTransformBlocks(
          slice.content,
          WRITING_BLOCK_NAME,
        );
        writingBlocks.forEach((writingBlock) => {
          if (
            writingBlock.attrs.writingBlockId &&
            !isEmptyUuid(writingBlock.attrs.writingBlockId)
          ) {
            // Force change readonly data
            // @ts-ignore
            writingBlock.attrs.originalBlockId =
              writingBlock.attrs.writingBlockId;
            // Force change readonly data
            // @ts-ignore
            writingBlock.attrs.writingBlockId = EMPTY_UUID;
          }
        });

        return slice;
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON());
      innerContent.current = editor.getJSON();
    },
    autofocus: false,
    onSelectionUpdate: (event) => {
      // @ts-ignore
      setActiveEditor(event.editor);
    },
    onFocus: (event) => {
      // @ts-ignore
      setActiveEditor(event.editor);
    },
  });
};

export type BaseEditorProps = {
  editor: Editor;
};

const BaseEditor = ({ editor }: BaseEditorProps) => {
  return (
    <main style={{ margin: 15 }} spellCheck={false}>
      <EditorContent style={{ width: "100%" }} editor={editor} />
    </main>
  );
};

export default BaseEditor;
