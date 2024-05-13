import create from "zustand";
import {
  GetHighlightDocument_documentGet_highlights_thread as IThread,
  GetHighlightDocument,
  AddHighlightDoc,
  AddHighlightDocVariables,
  CreateCommentVariables,
  CreateComment,
  DeleteComment,
  RemoveHighlightDocVariables,
  RemoveHighlightDoc,
} from "../graphql/types";
import { GET_HIGHLIGHT_DOCUMENT } from "graphql/query/ThreadQuery";
import { mutate, query } from "graphql/ApolloClient";
import {
  ADD_HIGHLIGHT_DOC,
  CREATE_COMMENT,
  DELETE_COMMENT,
  REMOVE_HIGHLIGHT_DOC,
} from "graphql/mutation/ThreadMutation";
import useDocumentStore, { PanelContentType } from "./ZustandDocumentStore";
import { HIGHLIGHT_RULE_REGEX } from "util/RegexMatch";

export type HighlightData = {
  id: string;
  documentId: string;
  content: string;
  type?: string;
  originalText?: string;
};

export type IHighlightStore = {
  selectedHighlight: string;
  highlights: Map<string, HighlightData>; // <Highlight id, ...>
  threads: Map<string, IThread>; // <Highlight id, ...>
  getThreads: (documentId: number) => Promise<void>;
  syncHighlights: (documentBody: string, documentId: string) => void;
  addHighlight: (newHighlight: AddHighlightDocVariables) => Promise<void>;
  removeHighlight: (highlight: RemoveHighlightDocVariables) => Promise<void>;
  addComment: (
    comment: CreateCommentVariables,
    highlightId: string,
  ) => Promise<void>;
  removeComment: (commentId: number, highlightId: string) => Promise<void>;
};

const useHighlightStore = create<IHighlightStore>((set, get) => ({
  selectedHighlight: "",
  highlights: new Map(),
  threads: new Map(),
  getThreads: async (documentId: number) => {
    const data = await query<GetHighlightDocument>(
      {
        query: GET_HIGHLIGHT_DOCUMENT,
        variables: {
          documentId,
        },
        fetchPolicy: "no-cache",
      },
      true,
      (error) => {
        throw error?.message;
      },
    );
    if (data) {
      set(({ threads }) => {
        const instanceThreads = new Map(threads);
        data.documentGet.highlights.map((highlight) => {
          instanceThreads.set(highlight.uuid, highlight.thread);
        });
        return { threads: instanceThreads };
      });
    }
  },
  syncHighlights: (documentBody, documentId) => {
    // const parsedHighlights = parseHighlightsBlock(documentId, documentBody);
    // const currentHighlights = Array.from(get().highlights.values()).filter(
    //   (h) => h.documentId === documentId,
    // );
    // if (checkTwoHighlights(parsedHighlights, currentHighlights)) {
    //   set(({ highlights }) => {
    //     const instanceHighlights = new Map(
    //       Array.from(highlights).filter(
    //         ([_, value]) => value.documentId !== documentId,
    //       ),
    //     );
    //     parsedHighlights.map((hl) => instanceHighlights.set(hl.id, hl));
    //     return {
    //       highlights: instanceHighlights,
    //     };
    //   });
    // }
  },
  addHighlight: async (newHighlight: AddHighlightDocVariables) => {
    const { documentAddHighlight } = await mutate<AddHighlightDoc>({
      mutation: ADD_HIGHLIGHT_DOC,
      variables: newHighlight,
    });
    if (documentAddHighlight) {
      set(({ threads }) => {
        const instanceThreads = new Map(threads);
        instanceThreads.set(
          documentAddHighlight.uuid,
          documentAddHighlight.thread,
        );
        return {
          threads: instanceThreads,
          selectedHighlight: documentAddHighlight.uuid,
        };
      });
    }
    if (
      useDocumentStore.getState().documentConfig.rightPanelTab !==
      PanelContentType.Feedback
    ) {
      useDocumentStore.getState().changeRightPanel(PanelContentType.Feedback);
    }
  },
  removeHighlight: async (highlight: RemoveHighlightDocVariables) => {
    const { documentRemoveHighlight } = await mutate<RemoveHighlightDoc>({
      mutation: REMOVE_HIGHLIGHT_DOC,
      variables: highlight,
    });
    if (documentRemoveHighlight) {
      const instanceThreads = new Map(get().threads);
      instanceThreads.delete(highlight.highlightId);
      set({ threads: instanceThreads });
    }
  },
  addComment: async (comment: CreateCommentVariables, highlightId: string) => {
    const { addComment } = await mutate<CreateComment>({
      mutation: CREATE_COMMENT,
      variables: comment,
    });
    if (addComment) {
      const instanceThreads = new Map(get().threads);
      instanceThreads.get(highlightId).comments.push(addComment);
      set({ threads: instanceThreads });
    }
  },
  removeComment: async (commentId: number, highlightId: string) => {
    const { removeComment } = await mutate<DeleteComment>({
      mutation: DELETE_COMMENT,
      variables: { commentId },
    });
    if (removeComment) {
      const instanceThreads = new Map(get().threads);
      instanceThreads.get(highlightId).comments = instanceThreads
        .get(highlightId)
        .comments.filter((comment) => comment.id !== commentId);
      set({ threads: instanceThreads });
    }
  },
  setSelectedHighlight: (highlightId: string) => {
    set({ selectedHighlight: highlightId });
  },
}));

const checkTwoHighlights = (
  highlights: HighlightData[],
  secondHighlights: HighlightData[],
): boolean => {
  if (highlights.length !== secondHighlights?.length) return true;
  return highlights.some(
    (hl, index) =>
      secondHighlights[index].id === hl.id &&
      (secondHighlights[index].content !== hl.content ||
        secondHighlights[index].originalText !== hl.originalText),
  );
};

export default useHighlightStore;
