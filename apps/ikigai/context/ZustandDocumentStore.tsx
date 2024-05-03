import create from "zustand";
import cloneDeep from "lodash/cloneDeep";

import {
  AddDocumentStandalone,
  GetDocumentAssignedUsers_documentGet_assignedUsers as IAssignedUser,
  GetDocumentDetail,
  GetDocumentDetail_documentGet as IDocument,
  GetDocumentDetail_documentGet_assignment,
  NewDocument,
  OrgRole,
  TeacherStartSubmission,
  UpdateAssignment,
  UpdateAssignmentData,
  UpdateAssignmentVariables,
  UpdateDocument,
  UpdateDocumentData,
} from "graphql/types";
import { BlockData, parseFeedbackBlock, parseQuizBlock } from "util/BlockUtil";
import { getApolloClient, mutate, query } from "graphql/ApolloClient";
import {
  STUDENT_SUBMIT_SUBMISSION,
  TEACHER_START_SUBMISSION,
  UPDATE_ASSIGNMENT,
} from "graphql/mutation";
import { GET_DOCUMENT_DETAIL } from "graphql/query/DocumentQuery";
import { UPDATE_DOCUMENT } from "../graphql/mutation/SpaceMutation";
import {
  ADD_DOCUMENT_STANDALONE,
  DOCUMENT_UPDATE_PUBLIC,
} from "graphql/mutation/DocumentMutation";
import { DocumentType, getDocumentType } from "util/permission";
import useAuthUserStore from "./ZustandAuthStore";
import { DEFAULT_LEFT_SIDE_WIDTH } from "../util";
import { debounce } from "lodash";

export interface IPermission {
  camera?: string;
  microphone?: string;
}

export enum PanelContentType {
  Submission = "Submission",
  Feedback = "Feedback",
  SettingQuizzes = "SettingQuizzes",
}

export enum PermissionType {
  GRANTED = "granted",
  DENIED = "denied",
  PROMPT = "prompt",
}

export enum EditorConfigType {
  DEFAULT = "Default",
  STYLE_SERIF = "Serif",
  STYLE_MONO = "Mono",
  SIZE_LARGE = "Large",
  WIDTH_STANDARD = "Standard",
  WIDTH_WIDE = "Wide",
}

export type DocumentConfig = {
  rightPanelTab: PanelContentType | undefined;
  showGradeButton?: boolean;
  showFeedbackButton?: boolean;
  showCountdown?: boolean;
  showQuestionList?: boolean;
  showGradeSummary?: boolean;
  showAssignees?: boolean;
  showReminder?: boolean;
  showAssignmentReport?: boolean;
  showQuizReview?: boolean;
  showQuizSettingReview?: boolean;
};

export const getDocumentConfigDefault = (doc: IDocument) => {
  const config: DocumentConfig = {
    rightPanelTab: undefined,
    showGradeButton: false,
    showFeedbackButton: true,
    showCountdown: false,
    showQuestionList: false,
    showGradeSummary: false,
    showAssignees: false,
    showReminder: false,
    showAssignmentReport: false,
    showQuizReview: false,
  };

  const userInfo = useAuthUserStore.getState().currentUser;
  const isStudent =
    userInfo?.userMe?.activeUserAuth?.orgRole === OrgRole.STUDENT;
  const documentType = getDocumentType(doc);
  if (documentType === DocumentType.Submission) {
    if (
      isStudent &&
      (!doc.submission.isSubmitted || doc.submission.allowRework)
    ) {
      // Doing Submission
      config.showFeedbackButton = doc.submission.allowRework;
      config.showCountdown = true;
      config.showQuestionList = true;
      config.rightPanelTab = PanelContentType.Submission;
      config.showAssignees = false;
      config.showReminder = false;
      return config;
    }

    // Reviewed Submission
    config.rightPanelTab = PanelContentType.Submission;
    config.showCountdown = false;
    config.showGradeButton = true;
    config.showFeedbackButton = true;
    config.showQuestionList = true;
    config.showGradeSummary = true;
    config.showAssignees = false;
    config.showReminder = false;
    config.showQuizReview =
      !isStudent || doc.submission.allowForStudentViewAnswer;
    return config;
  }

  if (documentType === DocumentType.Assignment) {
    config.showAssignmentReport = false;
    config.showQuizSettingReview = true;
    if (userInfo?.userMe?.activeUserAuth?.orgRole === OrgRole.STUDENT) {
      config.showFeedbackButton = false;
      config.showAssignees = false;
    }
  }
  return config;
};

const saveInServer = debounce(
  async (documentId: string, data: UpdateDocumentData) => {
    useDocumentStore.setState({ isSaving: true });
    await mutate<UpdateDocument>({
      mutation: UPDATE_DOCUMENT,
      variables: {
        documentId,
        data,
      },
    });
    useDocumentStore.setState({ isSaving: false });
  },
  300,
);

export type IDocumentStore = {
  isPreviewMode: boolean;
  documentConfig: DocumentConfig;
  fetchError?: string;
  masterDocumentId: string;
  masterDocument: IDocument | undefined;
  masterDocumentType: DocumentType | undefined;
  feedbacks: BlockData[];
  permissions: IPermission;
  setMasterDocument: (activeDocument: IDocument | undefined) => void;
  fetchAndSetDocument: (documentId: string) => Promise<IDocument>;
  update: (
    documentId: string,
    data: Partial<UpdateDocumentData>,
    isUpdateLocalOnly?: boolean,
  ) => void;
  updateAssignment: (data: Partial<UpdateAssignmentData>) => Promise<void>;
  submitSubmission: () => Promise<number>;
  startSubmissionByTeacher: (
    studentId: number,
  ) => Promise<{ id: number; documentId: string } | undefined>;

  // For handling case: force pause audio when closing assignment.
  isClose?: boolean;
  setIsClose?: (value: boolean) => void;

  switchPublic: (isPublic: boolean) => Promise<void>;
  setFeedback: (body: string) => void;
  setHeaderConfig: (newConfig: Partial<DocumentConfig>) => void;
  changeRightPanel: (panelType: PanelContentType) => void;

  createDocument: (
    title: string,
    body: string,
    parentId?: string,
    index?: number,
    space_id?: number,
    isAssigment?: boolean,
  ) => Promise<string>;

  currentLeftPanelWidth: number;
  setCurrentLeftPanelWidth: (width: number) => void;
  leftPanelHidden?: boolean;
  setLeftPanelHidden?: (value: boolean) => void;
  rightPanelHidden?: boolean;
  setRightPanelHidden?: (value: boolean) => void;
  setPermissions: (value: IPermission) => void;
  isSaving: boolean;

  // Map<documentId, IDocument>;
  mapAvailableDocument: Map<string, IDocument>;
  updateMapAvailableDocument: (
    documentId: string,
    document?: IDocument,
    updateData?: UpdateDocumentData,
  ) => void;
  loadingDocumentMaterial?: boolean;

  // Focus Mode
  setFocusMode: (isFocusMode: boolean) => void;
  isFocusMode: boolean;

  // Assigned Users
  assignedUsers: IAssignedUser[];
  addAssignedUsers: (assignedUsers: IAssignedUser[]) => void;
  removeAssignedUsers: (assignedUsers: IAssignedUser[]) => void;
};

const useDocumentStore = create<IDocumentStore>((set, get) => ({
  isPreviewMode: false,
  documentConfig: {
    rightPanelTab: undefined,
  },
  feedbacks: [],
  isClose: false,
  setIsClose: (value: boolean) => {
    set({ isClose: value });
  },
  masterDocument: undefined,
  masterDocumentType: undefined,
  permissions: {
    camera: "",
    microphone: "",
  },
  documentQuizzes: new Map(),
  mapAvailableDocument: new Map(),
  masterDocumentId: undefined,
  isSaving: false,
  isFocusMode: false,
  setMasterDocument: (doc: IDocument | undefined) => {
    const masterDocument = cloneDeep(doc);
    const quizzes = parseQuizBlock(masterDocument?.body || "");
    // We should update the metadata
    if (masterDocument?.submission) {
      quizzes.forEach((quiz) => {
        const quizAnswer = masterDocument.quizzes.find((q) => q.id === quiz.id);
        let isAnswered = !!quizAnswer?.myAnswer;
        if (quiz.content.includes("{bl%")) {
          isAnswered = !!quizAnswer?.myAnswer?.answer?.answer;
        }

        quiz.metadata = {
          answer: {
            isAnswered,
          },
        };
      });
    }

    set({
      masterDocumentId: masterDocument?.id,
      masterDocument,
      masterDocumentType: getDocumentType(masterDocument),
      feedbacks: parseFeedbackBlock(masterDocument?.body || ""),
      documentConfig: getDocumentConfigDefault(masterDocument),
    });
  },
  updateMapAvailableDocument: (documentId, document, updateData) => {
    set(({ mapAvailableDocument }) => {
      const instanceMapAvailableDocument = new Map(mapAvailableDocument);
      if (document) {
        instanceMapAvailableDocument.set(documentId, document);
      }

      if (updateData) {
        instanceMapAvailableDocument.set(documentId, {
          ...instanceMapAvailableDocument.get(documentId),
          ...updateData,
        });
      }

      return { mapAvailableDocument: instanceMapAvailableDocument };
    });
  },
  fetchAndSetDocument: async (documentId) => {
    set({ fetchError: undefined });
    const data = await query<GetDocumentDetail>(
      {
        query: GET_DOCUMENT_DETAIL,
        variables: {
          documentId,
        },
        fetchPolicy: "no-cache",
      },
      true,
      (error) => {
        set({ fetchError: error?.message });
      },
    );
    if (data) {
      const isMasterDocument = get().masterDocumentId === documentId;
      if (isMasterDocument) {
        set({ masterDocument: data.documentGet });
      }
      get().updateMapAvailableDocument(documentId, data.documentGet);
    }
    return data.documentGet;
  },
  update: (documentId, data, isUpdateLocalOnly) => {
    const docs = get().mapAvailableDocument;
    let doc = docs.get(documentId);
    if (doc) {
      const newDoc = {
        ...doc,
        ...data,
      };
      docs.set(documentId, newDoc);
      set({ mapAvailableDocument: docs });
      doc = newDoc;
    }

    if (documentId === get().masterDocument?.id) {
      const newDoc = {
        ...get().masterDocument,
        ...data,
      };
      set({ masterDocument: newDoc });
      doc = newDoc;
    }

    !isUpdateLocalOnly &&
      saveInServer(documentId, {
        title: doc.title,
        body: doc.body,
        coverPhotoId: doc.coverPhotoId,
        editorConfig: doc.editorConfig,
      });
  },
  updateAssignment: async (data: Partial<UpdateAssignmentData>) => {
    const currentAssignment = get().masterDocument?.assignment;
    if (!currentAssignment) return;

    const {
      id,
      gradedType,
      maxNumberOfAttempt,
      preDescription,
      testDuration,
      bandScoreId,
      gradeMethod,
      allowSubmissionChangeStructure,
      gradeByRubricId,
      weightingIntoFinalGrade,
    } = currentAssignment;

    const updatingData: UpdateAssignmentVariables = {
      assignmentId: id,
      data: {
        gradedType,
        maxNumberOfAttempt,
        preDescription,
        testDuration,
        bandScoreId,
        gradeMethod,
        forceAutoSubmit: true,
        allowSubmissionChangeStructure,
        gradeByRubricId,
        weightingIntoFinalGrade,
        ...data,
      },
    };

    const {
      data: { assignmentUpdate },
    } = await getApolloClient().mutate<UpdateAssignment>({
      mutation: UPDATE_ASSIGNMENT,
      variables: updatingData,
    });

    if (assignmentUpdate) {
      const activeDocument = get().masterDocument;
      activeDocument.assignment = {
        ...activeDocument.assignment,
        ...data,
      } as GetDocumentDetail_documentGet_assignment;
      set({ masterDocument: activeDocument });
    }
  },
  submitSubmission: async () => {
    const activeDocument = get().masterDocument;
    if (!activeDocument || !activeDocument.submission) return;

    const submissionId = activeDocument.submission.id;
    await mutate({
      mutation: STUDENT_SUBMIT_SUBMISSION,
      variables: {
        submissionId,
      },
    });

    return submissionId;
  },
  startSubmissionByTeacher: async (studentId) => {
    const activeDocument = get().masterDocument;
    if (!activeDocument || !activeDocument.assignment) return;
    const assignmentId = activeDocument.assignment.id;

    const data = await mutate<TeacherStartSubmission>({
      mutation: TEACHER_START_SUBMISSION,
      variables: {
        assignmentId,
        studentId,
      },
    });

    return data?.assignmentStartByTeacher;
  },
  switchPublic: async (isPublic) => {
    const activeDocument = get().masterDocument;
    if (!activeDocument) return;

    const data = await mutate({
      mutation: DOCUMENT_UPDATE_PUBLIC,
      variables: {
        documentId: activeDocument.id,
        isPublic,
      },
    });
    if (data) {
      activeDocument.isPublic = isPublic;
      set({
        masterDocument: activeDocument,
      });
    }
  },
  setFeedback: (body: string) => {
    const feedbacks = parseFeedbackBlock(body);
    set({ feedbacks });
  },
  setHeaderConfig: (newConfig) => {
    const currentConfig = get().documentConfig;
    set({
      documentConfig: { ...currentConfig, ...newConfig },
    });
  },
  changeRightPanel: (panelType) => {
    const openPanel = get().documentConfig.rightPanelTab;
    if (openPanel === panelType) {
      get().setHeaderConfig({ rightPanelTab: undefined });
    } else {
      get().setRightPanelHidden(false);
      get().setHeaderConfig({ rightPanelTab: panelType });
    }
  },
  createDocument: async (
    title,
    body,
    parentId,
    index = 0,
    spaceId,
    isAssignment = false,
  ) => {
    const data: NewDocument = {
      title,
      body,
      index,
      parentId,
      editorConfig: {
        size: EditorConfigType.DEFAULT,
        style: EditorConfigType.DEFAULT,
        width: EditorConfigType.WIDTH_STANDARD,
      },
    };
    const res = await mutate<AddDocumentStandalone>({
      mutation: ADD_DOCUMENT_STANDALONE,
      variables: {
        data,
        spaceId,
        isAssignment,
      },
    });
    if (res?.documentCreate) {
      return res?.documentCreate?.id;
    }
    return null;
  },
  currentLeftPanelWidth: DEFAULT_LEFT_SIDE_WIDTH,
  setCurrentLeftPanelWidth: (width: number) => {
    set({ currentLeftPanelWidth: width });
  },
  leftPanelHidden: false,
  setLeftPanelHidden: (value) => {
    set({ leftPanelHidden: value });
  },
  rightPanelHidden: false,
  setRightPanelHidden: (value) => {
    set({ rightPanelHidden: value });
    get().setHeaderConfig({ rightPanelTab: undefined });
  },
  setPermissions: (newPermissions: IPermission) => {
    set({
      permissions: { ...get().permissions, ...newPermissions },
    });
  },
  setFocusMode: (isFocusMode: boolean) => {
    set({ isFocusMode });
  },
  assignedUsers: [],
  addAssignedUsers: (assignedUsers) => {
    const currentAssignedUsers = get().assignedUsers;
    assignedUsers.forEach((assignedUser) => {
      if (
        !currentAssignedUsers.some(
          (c) => c.assignedUserId === assignedUser.assignedUserId,
        )
      ) {
        currentAssignedUsers.push(assignedUser);
      }
    });

    set({ assignedUsers: [...currentAssignedUsers] });
  },
  removeAssignedUsers: (assignedUsers) => {
    const currentAssignedUsers = get().assignedUsers;
    assignedUsers.forEach((assignedUser) => {
      const index = currentAssignedUsers.findIndex(
        (c) => c.assignedUserId === assignedUser.assignedUserId,
      );
      if (index > -1) {
        currentAssignedUsers.splice(index, 1);
      }
    });

    set({ assignedUsers: [...currentAssignedUsers] });
  },
}));

export const getSpaceIdFromDocument = (doc?: IDocument): number | undefined =>
  doc.spaceId;

export default useDocumentStore;
