import create from "zustand";
import { cloneDeep } from "lodash";

import {
  DocumentType,
  GetDocuments_spaceGet_documents,
  GetDocumentV2_documentGet,
  UpdateAssignmentData,
  GetSubmissionsOfAssignment_assignmentGetSubmissions,
} from "graphql/types";

export type IDocument = GetDocumentV2_documentGet;
export type ISpaceDocument = GetDocuments_spaceGet_documents;
export type ISubmission = GetSubmissionsOfAssignment_assignmentGetSubmissions;
export type IUpdateSpaceDocument = Partial<
  Omit<
    ISpaceDocument,
    "id" | "createdAt" | "assignment" | "submission" | "documentType"
  >
>;
export type IUpdateActiveDocument = Partial<
  Pick<
    IDocument,
    "title" | "coverPhotoUrl" | "coverPhotoId" | "iconType" | "iconValue"
  >
>;

type IDocumentStore = {
  isFolder: boolean;
  activeDocumentId?: string;
  activeDocument?: IDocument;
  spaceDocuments: ISpaceDocument[];
  setActiveDocument: (activeDocument: IDocument) => void;
  updateActiveDocument: (data: IUpdateActiveDocument) => void;
  updateActiveAssignment: (data: Partial<UpdateAssignmentData>) => void;
  setSpaceDocuments: (documents: ISpaceDocument[]) => void;
  addSpaceDocument: (document: ISpaceDocument) => void;
  updateSpaceDocument: (id: string, data: IUpdateSpaceDocument) => void;
  // Submissions
  submissions: ISubmission[];
  setSubmissions: (submissions: ISubmission[]) => void;
};

const useDocumentStore = create<IDocumentStore>((set, get) => ({
  isFolder: false,
  activeDocumentId: undefined,
  activeDocument: undefined,
  spaceDocuments: [],
  submissions: [],
  setActiveDocument: (activeDocument) => {
    set({
      activeDocumentId: activeDocument.id,
      activeDocument: cloneDeep(activeDocument),
      isFolder: activeDocument.documentType === DocumentType.FOLDER,
      submissions: [],
    });
  },
  updateActiveDocument: (data: IUpdateActiveDocument) => {
    const activeDocument = get().activeDocument;
    if (activeDocument) {
      Object.assign(activeDocument, data);
      set({ activeDocument });
    }
  },
  updateActiveAssignment: (data: Partial<UpdateAssignmentData>) => {
    const activeDocument = get().activeDocument;
    if (activeDocument && activeDocument.assignment) {
      activeDocument.assignment = {
        ...activeDocument.assignment,
        ...data,
      };
    }

    set({ activeDocument });
  },
  setSpaceDocuments: (documents: ISpaceDocument[]) => {
    set({ spaceDocuments: cloneDeep(documents) });
  },
  addSpaceDocument: (document: ISpaceDocument) => {
    const spaceDocuments = get().spaceDocuments;
    spaceDocuments.push(cloneDeep(document));
    set({ spaceDocuments });
  },
  updateSpaceDocument: (id: string, data: IUpdateSpaceDocument) => {
    const currentSpaceDocuments = get().spaceDocuments;
    const spaceDocument = currentSpaceDocuments.find(
      (spaceDocument) => spaceDocument.id === id,
    );
    Object.assign(spaceDocument, data);
    set({ spaceDocuments: currentSpaceDocuments });
  },
  setSubmissions: (submissions) => set({ submissions: cloneDeep(submissions) }),
}));

export default useDocumentStore;
