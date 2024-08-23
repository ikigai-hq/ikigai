import create from "zustand";

import { DocumentType, Role } from "graphql/types";
import { IDocument } from "./DocumentStore";
import { cloneDeep } from "lodash";

export enum LeftSideBarOptions {
  None = "None",
  Content = "Content",
  Gradebook = "Gradebook",
}

export type UIConfig = {
  leftSidebar: LeftSideBarOptions;
  hideLeftSide: boolean;
  hideHeader: boolean;
  showInformationPage: boolean;
  disableHeaderMenu: boolean;
  showGrading: boolean;
};

type IUIStore = {
  isEmbed: boolean;
  config: UIConfig;
  setConfig: (config: Partial<UIConfig>) => void;
};

const useUIStore = create<IUIStore>((set, get) => ({
  isEmbed: false,
  config: {
    leftSidebar: LeftSideBarOptions.None,
    hideLeftSide: false,
    hideHeader: false,
    showInformationPage: false,
    disableHeaderMenu: false,
    showGrading: false,
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
  showGrading: false,
};

export const SUBMISSION_UI_CONFIG: UIConfig = {
  leftSidebar: LeftSideBarOptions.None,
  hideLeftSide: true,
  hideHeader: false,
  showInformationPage: false,
  disableHeaderMenu: true,
  showGrading: false,
};

export const TEACHER_SUBMISSION_UI_CONFIG: UIConfig = {
  ...SUBMISSION_UI_CONFIG,
  hideLeftSide: false,
  hideHeader: false,
  showInformationPage: false,
  disableHeaderMenu: true,
  showGrading: false,
};

export const getUIConfig = (document: IDocument, role: Role) => {
  return cloneDeep(_getUIConfig(document, role));
};

const _getUIConfig = (document: IDocument, role: Role) => {
  const documentType = document.documentType;
  if (documentType === DocumentType.SUBMISSION) {
    const config = cloneDeep(getSubmissionUIConfig(role));
    if (document.submission.submitAt) {
      config.showGrading = true;
    }
    return config;
  }

  return NORMAL_UI_CONFIG;
};

export const getSubmissionUIConfig = (role: Role) => {
  if (role === Role.STUDENT) {
    return SUBMISSION_UI_CONFIG;
  }

  return TEACHER_SUBMISSION_UI_CONFIG;
};

export default useUIStore;
