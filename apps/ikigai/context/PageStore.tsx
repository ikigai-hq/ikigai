import create from "zustand";
import { cloneDeep } from "lodash";

import { GetPages_documentGet_pages } from "graphql/types";

export type IPage = GetPages_documentGet_pages;

type IPageStore = {
  activePageId?: string;
  setActivePageId: (pageId?: string) => void;
  pages: IPage[];
  setPages: (pages: IPage[]) => void;
  addPage: (pages: IPage) => void;
  removePage: (pageId: string) => void;
};

const usePageStore = create<IPageStore>((set, get) => ({
  activePageId: undefined,
  setActivePageId: (pageId) => {
    set({ activePageId: pageId });
  },
  pages: [],
  setPages: (pages) => set({ pages: cloneDeep(pages) }),
  addPage: (page) => {
    const pages = get().pages;
    pages.push(cloneDeep(page));

    set({ pages });
  },
  removePage: (pageId) => {
    const pages = get().pages;
    const index = pages.findIndex((page) => page.id === pageId);
    if (index > -1) {
      pages.splice(index, 1);
    }

    set({ pages: [...pages] });
  },
}));

export default usePageStore;
