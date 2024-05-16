import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: "Typing here...",
      }),
    ],
    onUpdate: ({ editor }) => {
      console.log("Hello editor", editor.getJSON());
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
