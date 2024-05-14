import create from "zustand";

type IPageStore = {
  activePageId?: string;
  setActivePageId: (pageId?: string) => void;
};

const usePageStore = create<IPageStore>((set, get) => ({
  activePageId: undefined,
  setActivePageId: (pageId) => {
    set({ activePageId: pageId });
  },
}));

export default usePageStore;
