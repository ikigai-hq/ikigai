import { ISpaceDocument } from "store/DocumentStore";

export type LearningItemType = ISpaceDocument & {
  indexTitle: string;
};

export type LearningModuleItemTypeWrapper = {
  data?: LearningItemType;
};
