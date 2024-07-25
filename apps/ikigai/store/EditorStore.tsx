import create from "zustand";
import { Editor } from "@tiptap/react";

export type ToolbarOptions = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  code: boolean;
  color: string;
  highlightColor?: string;
  textAlign?: string;
  headingLevel?: number;
  blockquote: boolean;
  bulletList: boolean;
  orderedList: boolean;
  todoList: boolean;
};

export type IEditorStore = {
  activeEditor?: Editor;
  editors: Record<string, Editor | null>;
  toolbarOptions?: ToolbarOptions;
  setActiveEditor: (editor?: Editor) => void;
  setToolbarOptions: (options: Partial<ToolbarOptions>) => void;
  addEditor: (pageContentId: string, editor: Editor | null) => void;
};

const useEditorStore = create<IEditorStore>((set, get) => ({
  activeEditor: undefined,
  editors: {},
  toolbarOptions: undefined,
  setActiveEditor: (editor) => {
    if (editor) {
      const currentEditor = get().activeEditor;
      if (editor !== currentEditor) {
        set({
          activeEditor: editor,
        });
      }

      set({
        toolbarOptions: {
          bold: editor.isActive("bold"),
          italic: editor.isActive("italic"),
          underline: editor.isActive("underline"),
          strike: editor.isActive("strike"),
          code: editor.isActive("code"),
          color: editor.getAttributes("textStyle").color,
          highlightColor: editor.getAttributes("highlight")?.color,
          textAlign: editor.getAttributes("textAlign")?.textAlign,
          headingLevel: editor.getAttributes("heading")?.level,
          blockquote: editor.isActive("blockquote"),
          bulletList: editor.isActive("bulletList"),
          orderedList: editor.isActive("orderedList"),
          todoList: editor.isActive("taskList"),
        },
      });
    } else {
      set({
        activeEditor: undefined,
        toolbarOptions: undefined,
      });
    }
  },
  setToolbarOptions: (options) => {
    const currentOptions = get().toolbarOptions;
    if (currentOptions) {
      set({
        toolbarOptions: {
          ...currentOptions,
          ...options,
        },
      });
    }
  },
  addEditor: (pageContentId, editor) => {
    const editors = get().editors;
    editors[pageContentId] = editor;
    set({ editors });
  },
}));

export default useEditorStore;
