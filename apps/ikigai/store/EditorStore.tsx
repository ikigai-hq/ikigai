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
};

export type IEditorStore = {
  activeEditor?: Editor;
  toolbarOptions?: ToolbarOptions;
  setActiveEditor: (editor?: Editor) => void;
  setToolbarOptions: (options: Partial<ToolbarOptions>) => void;
};

const useEditorStore = create<IEditorStore>((set, get) => ({
  activeEditor: undefined,
  toolbarOptions: undefined,
  setActiveEditor: (editor) => {
    if (editor) {
      set({
        activeEditor: editor,
        toolbarOptions: {
          bold: editor.isActive("bold"),
          italic: editor.isActive("italic"),
          underline: editor.isActive("underline"),
          strike: editor.isActive("strike"),
          code: editor.isActive("code"),
          color: editor.getAttributes("textStyle").color,
          highlightColor: editor.getAttributes("highlight")?.color,
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
}));

export default useEditorStore;
