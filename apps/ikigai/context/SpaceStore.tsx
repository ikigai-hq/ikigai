import create from "zustand";
import cloneDeep from "lodash/cloneDeep";

import {
  UpdatePositionData,
  UpdateDocumentPositions,
  GetDocuments_spaceGet,
} from "graphql/types";
import { mutate } from "graphql/ApolloClient";
import { UPDATE_DOCUMENT_POSITIONS } from "graphql/mutation/DocumentMutation";
import { LearningModuleItemTypeWrapper } from "components/common/LearningModuleDnd/types";
import { FlattenedItem } from "components/common/SortableTree/types";

export type ISpaceDetail = GetDocuments_spaceGet;

export type ISpaceContext = {
  spaceId?: number;
  space?: ISpaceDetail;
  setSpace: (space: ISpaceDetail) => void;
  spaceSettingVisible: boolean;
  setSpaceSettingVisible: (visible: boolean) => void;
  setSpaceName: (spaceName: string) => void;
  // Class Content Layout
  updateDocumentPositions: (items: UpdatePositionData[]) => Promise<boolean>;
  flattenTreeItems: FlattenedItem<LearningModuleItemTypeWrapper>[];
  setTreeItems: (
    flattenTreeItems: FlattenedItem<LearningModuleItemTypeWrapper>[],
  ) => void;
};

const useSpaceStore = create<ISpaceContext>((set, get) => ({
  spaceId: undefined,
  space: undefined,
  setSpaceName: (spaceName) => {
    const currentSpace = get().space;
    if (!currentSpace) return;

    set({
      space: {
        ...currentSpace,
        name: spaceName,
      },
    });
  },
  spaceSettingVisible: false,
  setSpaceSettingVisible: (visible) => set({ spaceSettingVisible: visible }),
  setSpace: (space) =>
    set({
      space: cloneDeep(space),
      spaceId: space.id,
    }),
  updateDocumentPositions: async (items) => {
    const res = await mutate<UpdateDocumentPositions>({
      mutation: UPDATE_DOCUMENT_POSITIONS,
      variables: {
        items,
      },
    });

    return !!res?.documentUpdatePositions;
  },
  flattenTreeItems: [],
  setTreeItems: (treeItems) => {
    set({ flattenTreeItems: treeItems });
  },
}));

export default useSpaceStore;
