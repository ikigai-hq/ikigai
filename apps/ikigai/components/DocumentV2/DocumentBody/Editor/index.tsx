"use client";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { SlashMenuTrigger } from "./extensions/SlashMenuTrigger";

export default function TiptapEditor() {
  const [editorContent, setEditorContent] = useState<JSONContent>();
  const [toggleSlashMenu, setToggleSlashMenu] = useState(false);
  const [matchingWord, setMatchingWord] = useState<string | undefined>(
    undefined,
  );
  const [slashRange, setSlashRange] = useState<{ from: number; to: number }>({
    from: 0,
    to: 0,
  });
  const [menuPosition, setMenuPosition] = useState<{
    left: number;
    right: number;
    top: number;
    bottom: number;
  }>();

  const floatingMenuRef = useRef<HTMLDivElement>(null);
  const editorBodyRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
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
      const rectCurrentParagraph = editor.view.coordsAtPos(slashRange.from);
      const editorBodyClientHeight = editorBodyRef.current?.clientHeight;
      const scrollY = window.scrollY;
      const floatingMenuRect = floatingMenuRef.current?.getBoundingClientRect();
      if (floatingMenuRect && editorBodyClientHeight) {
        if (
          rectCurrentParagraph.top + floatingMenuRect.height >
          editorBodyClientHeight / 2
        ) {
          rectCurrentParagraph.top =
            rectCurrentParagraph.top + scrollY - floatingMenuRect.height;
        } else {
          rectCurrentParagraph.top = rectCurrentParagraph.bottom + scrollY;
        }
      }
      setMenuPosition(rectCurrentParagraph);
      const SLASH_WORDS_REGEX = /\/\w+(\s+\w+)*\s*/;
      if (currentParagraph) {
        const textQuery = SLASH_WORDS_REGEX.exec(currentParagraph?.textContent);
        // console.log({ textQuery });
      }
      // console.log(
      //   "floating menu",
      //   floatingMenuRef.current?.getBoundingClientRect()
      // );
      // console.log("rect current paragraph", rectCurrentParagraph);
      // console.log("window coordinates", window.scrollY);
      // console.log("editor body ref", editorBodyRef.current?.clientHeight);
    }
  }, [toggleSlashMenu, matchingWord, editor]);

  return (
    <main ref={editorBodyRef} style={{ margin: "2rem" }}>
      <EditorContent style={{ width: "100%" }} editor={editor} />
      <div
        ref={floatingMenuRef}
        style={{
          display: toggleSlashMenu ? "block" : "none",
          color: "red",
          background: "beige",
          position: "absolute",
          borderRadius: 4,
          padding: 12,
          top: menuPosition ? menuPosition?.top : 0,
          left: menuPosition ? menuPosition?.left : 0,
        }}
      >
        <div>Bold</div>
        <div>Italic</div>
        <div>Underline</div>
      </div>
    </main>
  );
}
