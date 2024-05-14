import { useEffect, useRef, useState, MutableRefObject } from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { SlashMenuTrigger } from "./extensions/SlashMenuTrigger";
import SlashMenu from "./menus/SlashMenu";
import { Position } from "./types";

interface EditorProps {
  parentRef: MutableRefObject<HTMLDivElement>;
}

export default function TiptapEditor({ parentRef }: EditorProps) {
  const [editorContent, setEditorContent] = useState<JSONContent>();
  const [toggleSlashMenu, setToggleSlashMenu] = useState(false);
  const [matchingWord, setMatchingWord] = useState<string | undefined>(
    undefined,
  );
  const [slashRange, setSlashRange] = useState<{ from: number; to: number }>({
    from: 0,
    to: 0,
  });
  const [menuPosition, setMenuPosition] = useState<Position>();

  const floatingMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Writing something, or press "/" for commands...',
      }),
      SlashMenuTrigger.configure({
        setToggleSlashMenu,
        setMatchingWord,
        setSlashRange,
      }),
    ],
    content: "Hello World!",
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!matchingWord) {
      setToggleSlashMenu(false);
    }

    if (toggleSlashMenu && editor) {
      const currentParagraph = editor.state.selection.$from.parent;
      const currentParagraphRect = editor.view.coordsAtPos(slashRange.from);
      const documentBodyClientHeight = parentRef.current?.clientHeight;
      const documentBodyRect = parentRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const floatingMenuRect = floatingMenuRef.current?.getBoundingClientRect();
      if (floatingMenuRect && documentBodyClientHeight) {
        if (
          currentParagraphRect.top + floatingMenuRect.height >
          documentBodyClientHeight
        ) {
          currentParagraphRect.top =
            currentParagraphRect.top +
            scrollY -
            floatingMenuRect.height -
            documentBodyRect.y -
            8;
        } else {
          currentParagraphRect.top =
            currentParagraphRect.bottom + scrollY - documentBodyRect.y + 8;
        }
      }
      currentParagraphRect.left =
        currentParagraphRect.left - documentBodyRect.x;
      setMenuPosition(currentParagraphRect);
      const SLASH_WORDS_REGEX = /\/\w+(\s+\w+)*\s*/;
      if (currentParagraph) {
        const textQuery = SLASH_WORDS_REGEX.exec(currentParagraph?.textContent);
        // console.log({ textQuery });
      }
    }
  }, [toggleSlashMenu, matchingWord, editor]);

  return (
    <main style={{ margin: "2rem" }}>
      <EditorContent style={{ width: "100%" }} editor={editor} />
      <SlashMenu
        ref={floatingMenuRef}
        editor={editor}
        open={toggleSlashMenu}
        position={menuPosition}
      />
    </main>
  );
}
