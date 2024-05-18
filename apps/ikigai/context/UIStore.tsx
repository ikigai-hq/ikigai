import create from "zustand";

import { DocumentType, Role } from "graphql/types";

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

const TEACHER_FOLDER_UI_CONFIG: UIConfig = {
  hasLeftSidebar: true,
  hasRightSidebar: false,
  leftSidebarVisible: true,
  rightSidebarVisible: false,
};

const STUDENT_FOLDER_UI_CONFIG = {
  ...TEACHER_FOLDER_UI_CONFIG,
};

const TEACHER_ASSIGNMENT_UI_CONFIG: UIConfig = {
  hasLeftSidebar: true,
  hasRightSidebar: true,
  leftSidebarVisible: true,
  rightSidebarVisible: true,
};

const STUDENT_ASSIGNMENT_UI_CONFIG: UIConfig = {
  ...TEACHER_ASSIGNMENT_UI_CONFIG,
  hasRightSidebar: false,
  rightSidebarVisible: false,
};

const TEACHER_SUBMISSION_UI_CONFIG: UIConfig = {
  hasLeftSidebar: false,
  hasRightSidebar: true,
  leftSidebarVisible: false,
  rightSidebarVisible: true,
};

const STUDENT_SUBMISSION_UI_CONFIG: UIConfig = {
  ...TEACHER_SUBMISSION_UI_CONFIG,
  hasRightSidebar: false,
  rightSidebarVisible: false,
};

export const getUIConfig = (documentType: DocumentType, role: Role) => {
  if (role === Role.TEACHER) {
    if (documentType === DocumentType.FOLDER) return TEACHER_FOLDER_UI_CONFIG;
    if (documentType === DocumentType.ASSIGNMENT)
      return TEACHER_ASSIGNMENT_UI_CONFIG;
    return TEACHER_SUBMISSION_UI_CONFIG;
  }

  if (documentType === DocumentType.FOLDER) return STUDENT_FOLDER_UI_CONFIG;
  if (documentType === DocumentType.ASSIGNMENT)
    return STUDENT_ASSIGNMENT_UI_CONFIG;
  return STUDENT_SUBMISSION_UI_CONFIG;
};

export default useUIStore;
