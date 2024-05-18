import create from "zustand";

export type DocumentUIConfig = {
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
};

type IUIStore = {
  config: DocumentUIConfig;
  setConfig: (config: Partial<DocumentUIConfig>) => void;
};

const useUIStore = create<IUIStore>((set, get) => ({
  config: {
    leftSidebarVisible: true,
    rightSidebarVisible: true,
  },
  setConfig: (config) => {
    const currentConfig = get().config;
    set({
      config: {
        ...currentConfig,
        ...config,
      },
    });
  },
}));

export default useUIStore;
