import create from "zustand";
import { cloneDeep } from "lodash";

import {
  GetDocumentPageContents_documentGet_pages_pageContents,
  PageContentInput,
} from "graphql/types";

export type IPageContent =
  GetDocumentPageContents_documentGet_pages_pageContents;

type IPageContentStore = {
  pageContents: IPageContent[];
  setPageContents: (pageContents: IPageContent[]) => void;
  addPageContent: (pageContent: IPageContent) => void;
  updatePageContent: (pageContent: Partial<PageContentInput>) => void;
  removePageContent: (pageContentId: string) => void;
};

const usePageContentStore = create<IPageContentStore>((set, get) => ({
  pageContents: [],
  setPageContents: (pageContents) =>
    set({ pageContents: cloneDeep(pageContents) }),
  addPageContent: (pageContent) => {
    const pageContents = get().pageContents;
    pageContents.push(cloneDeep(pageContent));
    set({ pageContents });
  },
  updatePageContent: (pageContent) => {
    const pageContents = get().pageContents;
    const existingPageContent = pageContents.find(
      (content) => content.id === pageContent.id,
    );
    if (existingPageContent) {
      Object.assign(existingPageContent, cloneDeep(pageContent));
    }

    set({ pageContents });
  },
  removePageContent: (pageContentId) => {
    const pageContents = get().pageContents;
    const index = pageContents.findIndex(
      (content) => content.id === pageContentId,
    );
    if (index > -1) {
      pageContents.splice(index, 1);
    }

    set({ pageContents: [...pageContents] });
  },
}));

export default usePageContentStore;
