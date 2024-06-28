import {
  EditorContent,
  Extensions,
  JSONContent,
  useEditor,
} from "@tiptap/react";
import { useRef } from "react";

import useEditorStore from "store/EditorStore";

export type BaseEditorProps = {
  readOnly: boolean;
  onUpdate: (body: JSONContent) => void | Promise<void>;
  onForceSave: (body: JSONContent) => void | Promise<void>;
  extensions: Extensions;
  body?: JSONContent;
};

const BaseEditor = ({
  readOnly,
  body,
  onUpdate,
  extensions,
  onForceSave,
}: BaseEditorProps) => {
  const setActiveEditor = useEditorStore((state) => state.setActiveEditor);
  const innerContent = useRef(body);

  const editor = useEditor({
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

  return (
    <main style={{ margin: 15 }} spellCheck={false}>
      <EditorContent style={{ width: "100%" }} editor={editor} />
    </main>
  );
};

export default BaseEditor;
