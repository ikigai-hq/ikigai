import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  DocumentType,
  GetDocuments_spaceGet_documents as IDocumentItemList,
  SpaceActionPermission,
  UpdatePositionData,
} from "graphql/types";

import {
  FlattenedItem,
  TreeItemComponentType,
  TreeItems,
} from "../SortableTree/types";
import { debounce, isEqual } from "lodash";
import useSpaceStore from "store/SpaceStore";
import { LearningItemType, LearningModuleItemTypeWrapper } from "./types";
import { flattenTree, SortableTree } from "../SortableTree";
import {
  buildTree,
  findItemDeep,
  getFullPathFromNode,
} from "../SortableTree/utilities";
import usePermission from "hook/UsePermission";

export type LearningModuleDndProps = {
  docs: IDocumentItemList[];
  keyword: string;
  TreeItemComponent: TreeItemComponentType<Record<string, any>, HTMLElement>;
  defaultCollapsed: boolean;
  parentId: string | null;
};

const debounceUpdatePositions = debounce(
  useSpaceStore.getState().updateDocumentPositions,
  300,
);

export const LearningModuleDnd = ({
  docs,
  keyword,
  TreeItemComponent,
  defaultCollapsed,
  parentId,
}: LearningModuleDndProps) => {
  const allow = usePermission();
  const [cacheFlattenTrees, setCacheFlattenTrees] = useState<
    FlattenedItem<LearningModuleItemTypeWrapper>[]
  >([]);
  const [convertedItems, setConvertedItems] = useState([]);
  const router = useRouter();

  const canDnd = !keyword && allow(SpaceActionPermission.MANAGE_SPACE_CONTENT);
  useEffect(() => {
    const items = convertToTreeItems(
      docs.filter((doc) => !doc.deletedAt),
      parentId,
      defaultCollapsed,
      getFullPathFromNode(router.query?.documentId as string, docs)?.map(
        (f) => f.id,
      ),
      convertedItems,
      cacheFlattenTrees,
    );
    setConvertedItems(items);
  }, [docs]);

  const onChangeConvertedItems = (
    items: TreeItems<LearningModuleItemTypeWrapper>,
  ) => {
    setConvertedItems(items);
    setCacheFlattenTrees(flattenTree(items));
    const oldItems = convertToUpdatePositionData(convertedItems, parentId);
    const newItems = convertToUpdatePositionData(items, parentId);
    if (
      allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) &&
      !isEqual(oldItems, newItems)
    ) {
      debounceUpdatePositions(convertToUpdatePositionData(items, parentId));
    }
  };

  return (
    <SortableTree
      items={filterTree(convertedItems, keyword)}
      onItemsChanged={onChangeConvertedItems}
      TreeItemComponent={TreeItemComponent}
      disableSorting={!canDnd}
    />
  );
};

const convertToTreeItems = (
  docs: IDocumentItemList[],
  parentId: string | null,
  defaultCollapsed: boolean,
  listCollapsed: number[],
  previousItems?: TreeItems<LearningModuleItemTypeWrapper>,
  cacheFlattenTree?: FlattenedItem<LearningModuleItemTypeWrapper>[],
): TreeItems<LearningModuleItemTypeWrapper> => {
  return docs
    .filter((doc) => doc.parentId === parentId)
    .sort((docA, docB) => docA.index - docB.index)
    .map((doc) => {
      const isFolder = doc.documentType === DocumentType.FOLDER;
      let collapsed = !listCollapsed.includes(doc.id);
      if (previousItems && previousItems.length > 0) {
        const item = findItemDeep(previousItems, doc.id);
        if (item) collapsed = item.collapsed;
      } else if (cacheFlattenTree && cacheFlattenTree.length > 0) {
        const item = cacheFlattenTree.find((item) => item.id === doc.id);
        if (item) collapsed = item.collapsed;
      } else if (isFolder) {
        collapsed = false;
      }

      const children = convertToTreeItems(
        docs,
        doc.id,
        defaultCollapsed,
        listCollapsed,
        previousItems,
        cacheFlattenTree,
      );
      const childrenTitle = children
        .map((child) => child.data.indexTitle)
        .join("#");
      return {
        id: doc.id,
        children,
        data: {
          ...convertDocumentToLearningItemType(doc, childrenTitle),
        },
        collapsed,
        canHaveChildren: isFolder,
      };
    });
};

export const convertToUpdatePositionData = (
  items: TreeItems<LearningModuleItemTypeWrapper>,
  parentId?: string,
): UpdatePositionData[] => {
  const results: UpdatePositionData[] = [];
  items.forEach((item, index) => {
    results.push({
      id: item.data.id,
      parentId,
      index,
    });
    results.push(
      ...convertToUpdatePositionData(item.children, item.id as string),
    );
  });
  return results;
};

export const canVisibleByKeyword = (
  title: string,
  keyword: string,
): boolean => {
  if (!keyword) return true;

  return title.toLowerCase().includes(keyword.toLowerCase());
};

export const filterTree = (
  trees: TreeItems<LearningModuleItemTypeWrapper>,
  keyword: string,
): TreeItems<LearningModuleItemTypeWrapper> => {
  const items = flattenTree(trees).filter((item) =>
    canVisibleByKeyword(item.data.indexTitle, keyword),
  );

  return buildTree(items);
};

export const convertDocumentToLearningItemType = (
  document: IDocumentItemList,
  childrenTitle: string,
): LearningItemType => {
  return {
    ...document,
    indexTitle: `${document.title}#${childrenTitle}`,
  };
};

export default LearningModuleDnd;
