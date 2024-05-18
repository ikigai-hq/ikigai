import create from "zustand";

export type UIConfig = {
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
};

type IUIStore = {
  config: UIConfig;
  setConfig: (config: Partial<UIConfig>) => void;
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
