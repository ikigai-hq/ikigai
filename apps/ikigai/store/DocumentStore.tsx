import create from "zustand";
import { cloneDeep } from "lodash";

import {
  DocumentType,
  GetDocument_documentGet,
  GetDocuments_spaceGet_documents,
  GetSubmissionsOfAssignment_assignmentGetSubmissions,
  UpdateAssignmentData,
  GetDocument_documentGet_tags,
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
    | "title"
    | "coverPhotoUrl"
    | "coverPhotoId"
    | "iconType"
    | "iconValue"
    | "visibility"
  >
>;
export type ITag = GetDocument_documentGet_tags;

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
  // Saving
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
  // Tags
  addActiveDocumentTag: (tag: ITag) => void;
  removeActiveDocumentTag: (tag: ITag) => void;
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
  isSaving: false,
  setIsSaving: (isSaving) => set({ isSaving }),
  addActiveDocumentTag: (tag) => {
    const currentDocument = get().activeDocument;
    const existingTag = currentDocument.tags.find(
      (innerTag) => tag.tag == innerTag.tag,
    );
    const spaceDocuments = get().spaceDocuments;
    const existingDocument = spaceDocuments.find(
      (doc) => doc.id === currentDocument.id,
    );
    if (!existingTag) {
      currentDocument.tags.push(tag);
      if (existingDocument)
        existingDocument.tags = cloneDeep(currentDocument.tags);
      set({ activeDocument: currentDocument, spaceDocuments });
    }
  },
  removeActiveDocumentTag: (tag) => {
    const currentDocument = get().activeDocument;
    const index = currentDocument.tags.findIndex(
      (innerTag) => tag.tag == innerTag.tag,
    );
    const spaceDocuments = get().spaceDocuments;
    const existingDocument = spaceDocuments.find(
      (doc) => doc.id === currentDocument.id,
    );
    if (index > -1) {
      currentDocument.tags.splice(index, 1);
      currentDocument.tags = [...currentDocument.tags];
      existingDocument.tags = cloneDeep(currentDocument.tags);
      set({ activeDocument: currentDocument, spaceDocuments });
    }
  },
}));

type noop = (...args: any[]) => any;
export function wrapAsyncDocumentSavingFn<T extends noop>(
  fn: T,
): (...args: any[]) => Promise<ReturnType<T>> {
  return async (...args: any[]) => {
    try {
      useDocumentStore.getState().setIsSaving(true);
      return await fn(...args);
    } catch (e) {
      console.error("Cannot run document saving fn", e);
    } finally {
      useDocumentStore.getState().setIsSaving(false);
    }
  };
}

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

export const useAvailableTags = () => {
  const spaceDocuments = useDocumentStore((state) => state.spaceDocuments);
  const tags: ITag[] = [];
  spaceDocuments
    .flatMap((doc) => doc.tags)
    .forEach((tag) => {
      const existingTag = tags.find((innerTag) => innerTag.tag === tag.tag);
      if (!existingTag) tags.push(tag);
    });

  return tags;
};

export default useDocumentStore;
