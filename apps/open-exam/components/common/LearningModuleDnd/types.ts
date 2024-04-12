import { DocumentType } from "graphql/types";

export type LearningItemType = {
  id: string;
  title: string;
  index: number;
  createdAt: number;
  documentType: DocumentType;
  indexTitle: string;
  parentId: string;
};

export type LearningModuleItemTypeWrapper = {
  data: LearningItemType;
};
