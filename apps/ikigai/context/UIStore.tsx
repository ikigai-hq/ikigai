import create from "zustand";

export type UIConfig = {
  hasLeftSidebar: boolean;
  leftSidebarVisible: boolean;
  hasRightSidebar: boolean;
  rightSidebarVisible: boolean;
};

type IUIStore = {
  config: UIConfig;
  setConfig: (config: Partial<UIConfig>) => void;
};

const useUIStore = create<IUIStore>((set, get) => ({
  config: {
    hasLeftSidebar: true,
    leftSidebarVisible: true,
    hasRightSidebar: true,
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
