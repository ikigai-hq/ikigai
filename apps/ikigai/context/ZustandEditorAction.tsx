import create from "zustand";
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import RichMarkdownEditor from "@ikigai/editor";

export interface Heading {
  title: string;
  level: number;
  id: string;
  offset: number;
}

export type IStore = {
  activeDocumentEditorId?: string;
  updateActiveDocumentEditorId: (documentId: string) => void;
  // Map<documentId, ...>
  mapEditorAction: Map<
    string,
    {
      editorView: EditorView | undefined;
      commands: Record<string, any> | undefined;
      editorFocus?: boolean;
      editorState?: EditorState;
      editorRef?: RichMarkdownEditor;
    }
  >;
  updateEditorAction: (documentId: string, ref: RichMarkdownEditor) => void;
  currentPointingEditorState?: EditorState;
  currentPointingDocumentId?: string;
  setCurrentPointingEditor?: (state: EditorState, documentId: string) => void;
};

const useEditorActionStore = create<IStore>((set, _get) => ({
  currentSelectionHeading: undefined,
  mapEditorAction: new Map(),
  mapHeading: new Map(),
  setCurrentPointingEditor: (state, documentId) => {
    set({
      currentPointingEditorState: state,
      currentPointingDocumentId: documentId,
    });
  },
  updateActiveDocumentEditorId: (documentId) => {
    set({ activeDocumentEditorId: documentId });
  },
  updateEditorAction: (documentId, ref) => {
    set(({ mapEditorAction }) => {
      const newInstance = new Map(mapEditorAction);
      return {
        mapEditorAction: newInstance.set(documentId, {
          editorView: ref.view,
          commands: ref.commands,
          editorRef: ref,
        }),
      };
    });
  },
}));

export default useEditorActionStore;
