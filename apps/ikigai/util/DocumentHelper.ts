import { GetDocumentDetail_documentGet as IDocument } from "graphql/types";

export enum DocumentType {
  Normal,
  Assignment,
  Submission,
}

export const getDocumentType = (doc?: IDocument | any): DocumentType => {
  if (doc?.assignment) return DocumentType.Assignment;
  if (doc?.submission) return DocumentType.Submission;

  return DocumentType.Normal;
};
