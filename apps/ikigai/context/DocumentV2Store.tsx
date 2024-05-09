import create from "zustand";
import { cloneDeep } from "lodash";

import {
  GetDocumentV2_documentGet as IDocument,
  GetDocuments_spaceGet_documents as ISpaceDocument,
} from "graphql/types";

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
  activeDocumentId?: string;
  activeDocument?: IDocument;
  spaceDocuments: ISpaceDocument[];
  setActiveDocument: (activeDocument: IDocument) => void;
  updateActiveDocument: (data: IUpdateActiveDocument) => void;
  setSpaceDocuments: (documents: ISpaceDocument[]) => void;
  updateSpaceDocument: (id: string, data: IUpdateSpaceDocument) => void;
};

const useDocumentStore = create<IDocumentStore>((set, get) => ({
  activeDocumentId: undefined,
  activeDocument: undefined,
  spaceDocuments: [],
  setActiveDocument: (activeDocument) => {
    set({
      activeDocumentId: activeDocument.id,
      activeDocument: cloneDeep(activeDocument),
    });
  },
  updateActiveDocument: (data: IUpdateActiveDocument) => {
    const activeDocument = get().activeDocument;
    if (activeDocument) {
      Object.assign(activeDocument, data);
      set({ activeDocument });
    }
  },
  setSpaceDocuments: (documents: ISpaceDocument[]) => {
    set({ spaceDocuments: cloneDeep(documents) });
  },
  updateSpaceDocument: (id: string, data: IUpdateSpaceDocument) => {
    const currentSpaceDocuments = get().spaceDocuments;
    const spaceDocument = currentSpaceDocuments.find(
      (spaceDocument) => spaceDocument.id === id,
    );
    Object.assign(spaceDocument, data);
    set({ spaceDocuments: currentSpaceDocuments });
  },
}));

export default useDocumentStore;
