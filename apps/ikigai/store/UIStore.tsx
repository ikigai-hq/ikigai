import create from "zustand";

import { DocumentType } from "graphql/types";
import { IDocument } from "./DocumentStore";

export enum LeftSideBarOptions {
  None = "None",
  Content = "Content",
}

export type UIConfig = {
  leftSidebar: LeftSideBarOptions;
  focusMode: boolean;
};

type IUIStore = {
  config: UIConfig;
  setConfig: (config: Partial<UIConfig>) => void;
};

const useUIStore = create<IUIStore>((set, get) => ({
  config: {
    leftSidebar: LeftSideBarOptions.None,
    focusMode: false,
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

export const NORMAL_UI_CONFIG: UIConfig = {
  leftSidebar: LeftSideBarOptions.None,
  focusMode: false,
};

export const SUBMISSION_UI_CONFIG: UIConfig = {
  leftSidebar: LeftSideBarOptions.None,
  focusMode: false,
};

export const getUIConfig = (document: IDocument) => {
  const documentType = document.documentType;
  if (documentType === DocumentType.SUBMISSION) return SUBMISSION_UI_CONFIG;

  return NORMAL_UI_CONFIG;
};

export default useUIStore;
