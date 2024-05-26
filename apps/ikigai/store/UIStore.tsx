import create from "zustand";

import { DocumentType, Role } from "graphql/types";
import { IDocument } from "./DocumentStore";

export enum RightSideBarOptions {
  None,
  EditContent,
  Grading,
}

export type UIConfig = {
  // Left Side Bar
  hasLeftSidebar: boolean;
  leftSidebarVisible: boolean;

  // Right Side Bard
  hasEditContentSidebar: boolean;
  hasGradeSidebar: boolean;
  rightSideBarVisible: RightSideBarOptions;

  // Header
  submitSubmission: boolean;
};

type IUIStore = {
  config: UIConfig;
  setConfig: (config: Partial<UIConfig>) => void;
};

const useUIStore = create<IUIStore>((set, get) => ({
  config: {
    hasLeftSidebar: true,
    leftSidebarVisible: true,

    hasEditContentSidebar: true,
    hasGradeSidebar: false,
    rightSideBarVisible: RightSideBarOptions.EditContent,

    submitSubmission: false,
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

const TEACHER_FOLDER_UI_CONFIG: UIConfig = {
  hasLeftSidebar: true,
  leftSidebarVisible: true,

  hasEditContentSidebar: false,
  hasGradeSidebar: false,
  rightSideBarVisible: RightSideBarOptions.EditContent,

  submitSubmission: false,
};

const STUDENT_FOLDER_UI_CONFIG = {
  ...TEACHER_FOLDER_UI_CONFIG,
};

const TEACHER_ASSIGNMENT_UI_CONFIG: UIConfig = {
  hasLeftSidebar: true,
  leftSidebarVisible: true,

  hasEditContentSidebar: true,
  hasGradeSidebar: false,
  rightSideBarVisible: RightSideBarOptions.EditContent,

  submitSubmission: false,
};

const STUDENT_ASSIGNMENT_UI_CONFIG: UIConfig = {
  ...TEACHER_ASSIGNMENT_UI_CONFIG,
  hasEditContentSidebar: false,
  rightSideBarVisible: RightSideBarOptions.None,
};

const TEACHER_SUBMISSION_UI_CONFIG: UIConfig = {
  hasLeftSidebar: false,
  leftSidebarVisible: false,

  hasEditContentSidebar: true,
  hasGradeSidebar: true,
  rightSideBarVisible: RightSideBarOptions.Grading,

  submitSubmission: false,
};

const STUDENT_DOING_SUBMISSION_UI_CONFIG: UIConfig = {
  ...TEACHER_SUBMISSION_UI_CONFIG,
  hasLeftSidebar: false,
  leftSidebarVisible: false,

  hasGradeSidebar: false,
  rightSideBarVisible: RightSideBarOptions.EditContent,

  submitSubmission: true,
};

const STUDENT_NON_DOING_SUBMISSION_UI_CONFIG: UIConfig = {
  ...TEACHER_SUBMISSION_UI_CONFIG,
  hasLeftSidebar: false,
  leftSidebarVisible: false,

  hasGradeSidebar: true,
  rightSideBarVisible: RightSideBarOptions.Grading,

  submitSubmission: false,
};

export const getUIConfig = (document: IDocument, role: Role) => {
  const documentType = document.documentType;
  if (role === Role.TEACHER) {
    if (documentType === DocumentType.FOLDER) return TEACHER_FOLDER_UI_CONFIG;
    if (documentType === DocumentType.ASSIGNMENT)
      return TEACHER_ASSIGNMENT_UI_CONFIG;
    return TEACHER_SUBMISSION_UI_CONFIG;
  }

  if (documentType === DocumentType.FOLDER) return STUDENT_FOLDER_UI_CONFIG;
  if (documentType === DocumentType.ASSIGNMENT)
    return STUDENT_ASSIGNMENT_UI_CONFIG;
  if (!document.submission?.submitAt) return STUDENT_DOING_SUBMISSION_UI_CONFIG;
  return STUDENT_NON_DOING_SUBMISSION_UI_CONFIG;
};

export default useUIStore;
