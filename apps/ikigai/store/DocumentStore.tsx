import create from "zustand";
import { cloneDeep } from "lodash";

import {
  DocumentType,
  GetDocument_documentGet,
  GetDocuments_spaceGet_documents,
  GetSubmissionsOfAssignment_assignmentGetSubmissions,
  UpdateAssignmentData,
} from "graphql/types";

export type IDocument = GetDocument_documentGet;
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
  removeSpaceDocument: (id: string) => undefined | string;
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
      isFolder: activeDocument.documentType === DocumentType.FOLDER,
      activeDocumentId: activeDocument.id,
      activeDocument: cloneDeep(activeDocument),
      submissions: [],
    });
  },
  updateActiveDocument: (data) => {
    const activeDocument = get().activeDocument;
    if (activeDocument) {
      Object.assign(activeDocument, data);
      set({ activeDocument });
    }
  },
  updateActiveAssignment: (data) => {
    const activeDocument = get().activeDocument;
    if (activeDocument && activeDocument.assignment) {
      activeDocument.assignment = {
        ...activeDocument.assignment,
        ...data,
      };
    }

    set({ activeDocument });
  },
  setSpaceDocuments: (documents) => {
    set({ spaceDocuments: cloneDeep(documents) });
  },
  addSpaceDocument: (document) => {
    const spaceDocuments = get().spaceDocuments;
    spaceDocuments.push(cloneDeep(document));
    set({ spaceDocuments });
  },
  updateSpaceDocument: (id, data) => {
    const currentSpaceDocuments = get().spaceDocuments;
    const spaceDocument = currentSpaceDocuments.find(
      (spaceDocument) => spaceDocument.id === id,
    );
    Object.assign(spaceDocument, data);
    set({ spaceDocuments: currentSpaceDocuments });
  },
  removeSpaceDocument: (id) => {
    const spaceDocuments = get().spaceDocuments;
    const removedIds = getAllByParentIds(spaceDocuments, id);
    removedIds.push(id);

    const newItems = spaceDocuments.filter(
      (spaceDocument) => !removedIds.includes(spaceDocument.id),
    );
    set({ spaceDocuments: newItems });

    return newItems.filter(
      (item) => item.documentType !== DocumentType.SUBMISSION,
    )[0]?.id;
  },
  setSubmissions: (submissions) => set({ submissions: cloneDeep(submissions) }),
}));

const getAllByParentIds = (
  items: ISpaceDocument[],
  parentId: string,
): string[] => {
  const result: string[] = [];

  const childrenItems = items.filter((item) => item.parentId === parentId);
  childrenItems.forEach((item) => {
    result.push(item.id);
    result.push(...getAllByParentIds(items, item.id));
  });

  return result;
};

export default useDocumentStore;
