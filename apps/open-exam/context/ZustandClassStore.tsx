import create from "zustand";
import cloneDeep from "lodash/cloneDeep";

import {
  GetClassById,
  GetClassById_classGet as IClassDetail,
  UpdatePositionData,
  UpdateDocumentPositions,
  ClassSoftDeleteDocuments, AddClassDocument,
} from "graphql/types";
import {
  ADD_CLASS_DOCUMENT,
} from "graphql/mutation/ClassMutation";
import { mutate, query } from "graphql/ApolloClient";
import { GET_CLASS_BY_ID } from "graphql/query/ClassQuery";
import {
  GetDocuments_classGet_classDocuments as IDocumentItemList,
  GetDocuments,
  DuplicateClassDocument,
} from "graphql/types";
import {
  DUPLICATE_CLASS_DOCUMENT,
} from "graphql/mutation/ClassMutation";
import { GET_CLASS_LESSONS } from "graphql/query/ClassQuery";
import {
  SOFT_DELETE_DOCUMENTS,
  UPDATE_DOCUMENT_POSITIONS,
} from "graphql/mutation/DocumentMutation";
import { LearningModuleItemTypeWrapper } from "../components/common/LearningModuleDnd/types";
import { FlattenedItem } from "../components/common/SortableTree/types";

export type IClassContext = {
  classId?: number;
  currentClass?: IClassDetail;
  fetchAndSetCurrentClass: (classId: number) => Promise<void>;
  setCurrentClass: (currentClass: IClassDetail | undefined) => void;
  // Class Documents
  documents?: IDocumentItemList[];
  setDocuments: (newDocuments: IDocumentItemList[] | undefined) => void;
  fetchAndSetDocuments: (classId: number) => Promise<void>;
  duplicateDocument: (
    documentId: string
  ) => Promise<DuplicateClassDocument | undefined>;
  deleteDocument: (documentId: string) => Promise<string[] | undefined>;
  updateDocumentPositions: (items: UpdatePositionData[]) => Promise<boolean>;
  addClassDocument: (documentId: string, isAssignment: boolean) => Promise<void>;
  // FIXME: This is not a good way to do this
  updateDocumentTitleLocal: (docId: number, title: string) => void;
  // Local cache collapsed value of docs:
  flattenTreeItems: FlattenedItem<LearningModuleItemTypeWrapper>[];
  setTreeItems: (
    flattenTreeItems: FlattenedItem<LearningModuleItemTypeWrapper>[]
  ) => void;
};

const useClassStore = create<IClassContext>((set, get) => ({
  classId: undefined,
  currentClass: undefined,
  setCurrentClass: (classData) => {
    if (!classData) {
      set({
        currentClass: undefined,
        documents: [],
        classId: undefined,
      });
      return;
    }

    const currentClass = cloneDeep(classData);

    const members = new Map();
    currentClass.members.forEach((member) => {
      members.set(member.userId, member);
    });

    set({
      currentClass: cloneDeep(currentClass),
      classId: currentClass.id,
    });
  },
  documents: undefined,
  setDocuments: (newDocuments: IDocumentItemList[] | undefined) => {
    set({
      documents: cloneDeep(
        (newDocuments || []).filter((doc) => !doc.document.deletedAt)
      ),
    });
  },
  duplicateDocument: async (documentId) => {
    const res = await mutate<DuplicateClassDocument>({
      mutation: DUPLICATE_CLASS_DOCUMENT,
      variables: {
        classId: get().classId,
        documentId,
      },
    });
    if (res.classDuplicateDocument) {
      const documents = get().documents;
      const newDocuments = [
        ...cloneDeep(documents),
        ...(res.classDuplicateDocument as IDocumentItemList[]),
      ];
      set({ documents: newDocuments });
    }

    return res;
  },
  deleteDocument: async (documentId) => {
    const documents = get().documents;
    const getChildIds = (parentId: string): string[] => {
      const result = [parentId];
      documents
        .filter((doc) => doc.document.parentId === parentId)
        .forEach((doc) => {
          result.push(...getChildIds(doc.documentId));
        });
      return result;
    };

    const documentIds = getChildIds(documentId);
    const res = await mutate<ClassSoftDeleteDocuments>({
      mutation: SOFT_DELETE_DOCUMENTS,
      variables: {
        classId: get().classId,
        documentIds,
      },
    });

    if (res.classSoftDeleteMultiple) {
      const filteredDoc = documents.filter(
        (doc) => !documentIds.includes(doc.documentId)
      );

      set({ documents: filteredDoc });
      return documentIds;
    }
  },
  addClassDocument: async (documentId, isAssignment) => {
    const res = await mutate<AddClassDocument>({
      mutation: ADD_CLASS_DOCUMENT,
      variables: {
        classId: get().classId,
        documentId,
        isAssignment
      },
    });

    const currentDocuments = get().documents;
    if (res) {
      currentDocuments.push(cloneDeep(res.classAddDocument));
      set({ documents: currentDocuments });
    }
  },
  fetchAndSetCurrentClass: async (classId) => {
    const data = await query<GetClassById>({
      query: GET_CLASS_BY_ID,
      variables: {
        classId: classId,
      },
      fetchPolicy: "network-only",
    });

    get().setCurrentClass(data?.classGet);
  },
  fetchAndSetDocuments: async (classId) => {
    const data = await query<GetDocuments>({
      query: GET_CLASS_LESSONS,
      variables: {
        classId,
      },
      fetchPolicy: "network-only",
    });
    
    get().setDocuments(data?.classGet?.classDocuments || []);
  },
  updateDocumentPositions: async (items) => {
    const res = await mutate<UpdateDocumentPositions>({
      mutation: UPDATE_DOCUMENT_POSITIONS,
      variables: {
        items,
      },
    });

    if (res && res.documentUpdatePositions) {
      const docs = get().documents;
      items.forEach((item) => {
        const currentDoc = docs.find((doc) => doc.documentId === item.id);
        if (currentDoc) {
          currentDoc.document.index = item.index;
          currentDoc.document.parentId = item.parentId || null;
        }
      });

      set({ documents: [...docs] });
    }

    return !!res?.documentUpdatePositions;
  },
  updateDocumentTitleLocal: (docId, title) => {
    const docs = get().documents;
    if (!docs) return;

    const doc = docs.find((doc) => doc.documentId === docId);
    if (doc) {
      doc.document.title = title;
      set({ documents: docs });
    }
  },
  flattenTreeItems: [],
  setTreeItems: (treeItems) => {
    set({ flattenTreeItems: treeItems });
  },
}));

export default useClassStore;
