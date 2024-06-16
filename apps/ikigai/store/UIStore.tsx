import create from "zustand";

import { DocumentType, Role } from "graphql/types";
import { IDocument } from "./DocumentStore";

export enum LeftSideBarOptions {
  None = "None",
  Content = "Content",
}

export type UIConfig = {
  leftSidebar: LeftSideBarOptions;
  hideLeftSide: boolean;
  hideHeader: boolean;
  showInformationPage: boolean;
  disableHeaderMenu: boolean;
};

type IUIStore = {
  config: UIConfig;
  setConfig: (config: Partial<UIConfig>) => void;
};

const useUIStore = create<IUIStore>((set, get) => ({
  config: {
    leftSidebar: LeftSideBarOptions.None,
    hideLeftSide: false,
    hideHeader: false,
    showInformationPage: false,
    disableHeaderMenu: false,
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
  hideLeftSide: false,
  hideHeader: false,
  showInformationPage: true,
  disableHeaderMenu: false,
};

export const SUBMISSION_UI_CONFIG: UIConfig = {
  leftSidebar: LeftSideBarOptions.None,
  hideLeftSide: true,
  hideHeader: false,
  showInformationPage: false,
  disableHeaderMenu: true,
};

export const TEACHER_SUBMISSION_UI_CONFIG: UIConfig = {
  ...SUBMISSION_UI_CONFIG,
  hideLeftSide: false,
  hideHeader: false,
  showInformationPage: false,
  disableHeaderMenu: true,
};

export const getUIConfig = (document: IDocument, role: Role) => {
  const documentType = document.documentType;
  if (documentType === DocumentType.SUBMISSION) {
    if (role === Role.STUDENT) {
      return SUBMISSION_UI_CONFIG;
    }

    return TEACHER_SUBMISSION_UI_CONFIG;
  }

  return NORMAL_UI_CONFIG;
};

export default useUIStore;
