import create from "zustand";
import cloneDeep from "lodash/cloneDeep";

import {
  UpdatePositionData,
  UpdateDocumentPositions,
  SoftDeleteDocuments,
  GetDocuments_spaceGet_documents as IDocumentItemList,
  GetDocuments,
  DuplicateSpaceDocument,
  GetDocuments_spaceGet,
} from "graphql/types";
import { mutate, query } from "graphql/ApolloClient";
import { DUPLICATE_SPACE_DOCUMENT } from "../graphql/mutation/SpaceMutation";
import { GET_SPACE_INFORMATION } from "../graphql/query/SpaceQuery";
import {
  SOFT_DELETE_DOCUMENTS,
  UPDATE_DOCUMENT_POSITIONS,
} from "graphql/mutation/DocumentMutation";
import { LearningModuleItemTypeWrapper } from "../components/common/LearningModuleDnd/types";
import { FlattenedItem } from "../components/common/SortableTree/types";

export type ISpaceDetail = GetDocuments_spaceGet;

export type ISpaceContext = {
  spaceId?: number;
  space?: ISpaceDetail;
  // Class Documents
  documents?: IDocumentItemList[];
  setDocuments: (newDocuments: IDocumentItemList[] | undefined) => void;
  fetchSpaceAndSetDocuments: (spaceId: number) => Promise<void>;
  duplicateDocument: (
    documentId: string,
  ) => Promise<DuplicateSpaceDocument | undefined>;
  deleteDocument: (documentId: string) => Promise<string[] | undefined>;
  updateDocumentPositions: (items: UpdatePositionData[]) => Promise<boolean>;
  // FIXME: This is not a good way to do this
  updateDocumentTitleLocal: (docId: number, title: string) => void;
  // Local cache collapsed value of docs:
  flattenTreeItems: FlattenedItem<LearningModuleItemTypeWrapper>[];
  setTreeItems: (
    flattenTreeItems: FlattenedItem<LearningModuleItemTypeWrapper>[],
  ) => void;
};

const useSpaceStore = create<ISpaceContext>((set, get) => ({
  spaceId: undefined,
  space: undefined,
  documents: undefined,
  setDocuments: (newDocuments: IDocumentItemList[] | undefined) => {
    set({
      documents: cloneDeep(
        (newDocuments || []).filter((doc) => !doc.deletedAt),
      ),
    });
  },
  duplicateDocument: async (documentId) => {
    const res = await mutate<DuplicateSpaceDocument>({
      mutation: DUPLICATE_SPACE_DOCUMENT,
      variables: {
        spaceId: get().spaceId,
        documentId,
      },
    });
    if (res.spaceDuplicateDocument) {
      const documents = get().documents;
      const newDocuments = [
        ...cloneDeep(documents),
        ...(res.spaceDuplicateDocument as unknown as IDocumentItemList[]),
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
        .filter((doc) => doc.parentId === parentId)
        .forEach((doc) => {
          result.push(...getChildIds(doc.id));
        });
      return result;
    };

    const documentIds = getChildIds(documentId);
    const res = await mutate<SoftDeleteDocuments>({
      mutation: SOFT_DELETE_DOCUMENTS,
      variables: {
        spaceId: get().spaceId,
        documentIds,
      },
    });

    if (res.spaceSoftDeleteMultiple) {
      const filteredDoc = documents.filter(
        (doc) => !documentIds.includes(doc.id),
      );

      set({ documents: filteredDoc });
      return documentIds;
    }
  },
  fetchSpaceAndSetDocuments: async (spaceId) => {
    const data = await query<GetDocuments>({
      query: GET_SPACE_INFORMATION,
      variables: {
        spaceId,
      },
      fetchPolicy: "network-only",
    });

    get().setDocuments(cloneDeep(data?.spaceGet?.documents) || []);
    set({
      space: cloneDeep(data?.spaceGet),
    });
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
        const currentDoc = docs.find((doc) => doc.id === item.id);
        if (currentDoc) {
          currentDoc.index = item.index;
          currentDoc.parentId = item.parentId || null;
        }
      });

      set({ documents: [...docs] });
    }

    return !!res?.documentUpdatePositions;
  },
  updateDocumentTitleLocal: (docId, title) => {
    const docs = get().documents;
    if (!docs) return;

    const doc = docs.find((doc) => doc.id === docId);
    if (doc) {
      doc.title = title;
      set({ documents: docs });
    }
  },
  flattenTreeItems: [],
  setTreeItems: (treeItems) => {
    set({ flattenTreeItems: treeItems });
  },
}));

export default useSpaceStore;
