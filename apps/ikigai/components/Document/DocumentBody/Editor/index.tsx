import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { t } from "@lingui/macro";
import { useEffect, useState } from "react";
import { useDebounce } from "ahooks";

import { IPageContent } from "context/PageContentStore";
import useAddOrUpdatePageContent from "hook/UseUpsertPageContent";

export type EditorProps = {
  pageContent: IPageContent;
};

const Editor = ({ pageContent }: EditorProps) => {
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
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: t`Typing content here...`,
      }),
    ],
    content: innerContent,
    onUpdate: ({ editor }) => {
      console.log("Hello editor", editor.getJSON());
      setInnerContent(editor.getJSON());
    },
    autofocus: false,
  });

  return (
    <main style={{ margin: 20 }}>
      <EditorContent style={{ width: "100%" }} editor={editor} />
    </main>
  );
};

export default Editor;
