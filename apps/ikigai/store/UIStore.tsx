import create from "zustand";

import { DocumentType, Role } from "graphql/types";
import { IDocument } from "./DocumentStore";

export enum LeftSideBarOptions {
  None = "None",
  Content = "Content",
}

export type UIConfig = {
  leftSidebar: LeftSideBarOptions;
};

type IUIStore = {
  config: UIConfig;
  setConfig: (config: Partial<UIConfig>) => void;
};

const useUIStore = create<IUIStore>((set, get) => ({
  config: {
    leftSidebar: LeftSideBarOptions.Content,
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
  leftSidebar: LeftSideBarOptions.Content,
};

export const SUBMISSION_UI_CONFIG: UIConfig = {
  leftSidebar: LeftSideBarOptions.None,
};

export const getUIConfig = (document: IDocument, _role: Role) => {
  const documentType = document.documentType;
  if (documentType === DocumentType.SUBMISSION) return SUBMISSION_UI_CONFIG;

  return NORMAL_UI_CONFIG;
};

export default useUIStore;
