import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { TextAlign } from "@tiptap/extension-text-align";
import { BulletList } from "@tiptap/extension-bullet-list";
import { ListItem } from "@tiptap/extension-list-item";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { t } from "@lingui/macro";
import { useEffect, useState } from "react";
import { useDebounce } from "ahooks";

import { IPageContent } from "store/PageContentStore";
import useAddOrUpdatePageContent from "hook/UseUpsertPageContent";
import useEditorStore from "store/EditorStore";

export type EditorProps = {
  readOnly: boolean;
  pageContent: IPageContent;
};

const Editor = ({ pageContent, readOnly }: EditorProps) => {
  const setActiveEditor = useEditorStore((state) => state.setActiveEditor);
  const [innerContent, setInnerContent] = useState<JSONContent>(
    pageContent.body,
  );
  const { upsert } = useAddOrUpdatePageContent(
    pageContent.id,
    pageContent.pageId,
  );
  const debouncedInnerContent = useDebounce(innerContent, { wait: 1000 });

  useEffect(() => {
    upsert({ body: debouncedInnerContent });
  }, [debouncedInnerContent]);

  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: t`Typing content here...`,
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      BulletList.configure({
        keepAttributes: true,
        keepMarks: true,
      }),
      OrderedList.configure({
        keepAttributes: true,
        keepMarks: true,
      }),
      ListItem,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: innerContent,
    onUpdate: ({ editor }) => {
      setInnerContent(editor.getJSON());
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
    <main style={{ margin: 15 }}>
      <EditorContent style={{ width: "100%" }} editor={editor} />
    </main>
  );
};

export default Editor;
