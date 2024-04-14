/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateDocument
// ====================================================

export interface UpdateDocument {
  documentUpdate: boolean;
}

export interface UpdateDocumentVariables {
  documentId: any;
  data: UpdateDocumentData;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DuplicateSpaceDocument
// ====================================================

export interface DuplicateSpaceDocument_spaceDuplicateDocument {
  id: any;
  title: string;
  createdAt: number;
  parentId: any | null;
  index: number;
  documentType: DocumentType;
  hideRule: HideRule;
  deletedAt: number | null;
  spaceId: number | null;
}

export interface DuplicateSpaceDocument {
  spaceDuplicateDocument: DuplicateSpaceDocument_spaceDuplicateDocument[];
}

export interface DuplicateSpaceDocumentVariables {
  spaceId: number;
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateSpace
// ====================================================

export interface CreateSpace_spaceCreate_starterDocument {
  id: any;
}

export interface CreateSpace_spaceCreate {
  id: number;
  orgId: number;
  starterDocument: CreateSpace_spaceCreate_starterDocument;
}

export interface CreateSpace {
  spaceCreate: CreateSpace_spaceCreate;
}

export interface CreateSpaceVariables {
  data: NewSpace;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DuplicateSpace
// ====================================================

export interface DuplicateSpace_spaceDuplicate {
  id: number;
}

export interface DuplicateSpace {
  spaceDuplicate: DuplicateSpace_spaceDuplicate;
}

export interface DuplicateSpaceVariables {
  spaceId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SoftDeleteSpace
// ====================================================

export interface SoftDeleteSpace {
  spaceSoftDelete: boolean;
}

export interface SoftDeleteSpaceVariables {
  spaceId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RestoreSpace
// ====================================================

export interface RestoreSpace_spaceRestore {
  id: number;
}

export interface RestoreSpace {
  spaceRestore: RestoreSpace_spaceRestore;
}

export interface RestoreSpaceVariables {
  spaceId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteSpace
// ====================================================

export interface DeleteSpace {
  spaceDelete: boolean;
}

export interface DeleteSpaceVariables {
  spaceId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DocumentUpdatePublic
// ====================================================

export interface DocumentUpdatePublic {
  documentUpdatePublic: boolean;
}

export interface DocumentUpdatePublicVariables {
  documentId: any;
  isPublic: boolean;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SoftDeleteDocuments
// ====================================================

export interface SoftDeleteDocuments {
  spaceSoftDeleteMultiple: boolean;
}

export interface SoftDeleteDocumentsVariables {
  documentIds: any[];
  spaceId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddDocumentStandalone
// ====================================================

export interface AddDocumentStandalone_documentCreate {
  id: any;
}

export interface AddDocumentStandalone {
  documentCreate: AddDocumentStandalone_documentCreate;
}

export interface AddDocumentStandaloneVariables {
  data: NewDocument;
  spaceId?: number | null;
  isAssignment: boolean;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateDocumentPositions
// ====================================================

export interface UpdateDocumentPositions {
  documentUpdatePositions: boolean;
}

export interface UpdateDocumentPositionsVariables {
  items: UpdatePositionData[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DocumentUpdateHideRule
// ====================================================

export interface DocumentUpdateHideRule {
  documentUpdateHideRule: boolean;
}

export interface DocumentUpdateHideRuleVariables {
  documentId: any;
  hideRule: HideRule;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DocumentAddPageBlock
// ====================================================

export interface DocumentAddPageBlock_documentAddPageBlock {
  id: any;
  documentId: any;
  title: string;
}

export interface DocumentAddPageBlock {
  documentAddPageBlock: DocumentAddPageBlock_documentAddPageBlock;
}

export interface DocumentAddPageBlockVariables {
  data: PageBlockInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DocumentAddPageBlockDocument
// ====================================================

export interface DocumentAddPageBlockDocument_documentAddPageBlockDocument_document {
  id: any;
  body: string;
}

export interface DocumentAddPageBlockDocument_documentAddPageBlockDocument {
  pageBlockId: any;
  documentId: any;
  index: number;
  createdAt: number;
  document: DocumentAddPageBlockDocument_documentAddPageBlockDocument_document;
}

export interface DocumentAddPageBlockDocument {
  documentAddPageBlockDocument: DocumentAddPageBlockDocument_documentAddPageBlockDocument;
}

export interface DocumentAddPageBlockDocumentVariables {
  data: PageBlockDocumentInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: documentClonePageBlock
// ====================================================

export interface documentClonePageBlock_documentClonePageBlock_nestedDocuments_document {
  id: any;
  body: string;
}

export interface documentClonePageBlock_documentClonePageBlock_nestedDocuments {
  pageBlockId: any;
  documentId: any;
  index: number;
  createdAt: number;
  document: documentClonePageBlock_documentClonePageBlock_nestedDocuments_document;
}

export interface documentClonePageBlock_documentClonePageBlock {
  id: any;
  documentId: any;
  title: string;
  nestedDocuments: documentClonePageBlock_documentClonePageBlock_nestedDocuments[];
}

export interface documentClonePageBlock {
  documentClonePageBlock: documentClonePageBlock_documentClonePageBlock;
}

export interface documentClonePageBlockVariables {
  fromId: any;
  toId: any;
  toDocumentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RestoreDocument
// ====================================================

export interface RestoreDocument {
  documentRestore: boolean;
}

export interface RestoreDocumentVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteDocumentPermanent
// ====================================================

export interface DeleteDocumentPermanent {
  documentDelete: boolean;
}

export interface DeleteDocumentPermanentVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ApplyDocumentTemplate
// ====================================================

export interface ApplyDocumentTemplate_documentApplyTemplate {
  id: any;
}

export interface ApplyDocumentTemplate {
  documentApplyTemplate: ApplyDocumentTemplate_documentApplyTemplate;
}

export interface ApplyDocumentTemplateVariables {
  originalDocumentId: any;
  templateId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SaveAsDocumentTemplate
// ====================================================

export interface SaveAsDocumentTemplate_orgAddTemplate {
  id: any;
}

export interface SaveAsDocumentTemplate {
  orgAddTemplate: SaveAsDocumentTemplate_orgAddTemplate;
}

export interface SaveAsDocumentTemplateVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddDocumentTemplateCategory
// ====================================================

export interface AddDocumentTemplateCategory_orgAddTemplateCategory_tags {
  tag: string;
}

export interface AddDocumentTemplateCategory_orgAddTemplateCategory {
  id: any;
  name: string;
  orgId: number;
  orgInternalIndex: number | null;
  isCommunity: boolean;
  communityIndex: number | null;
  tags: AddDocumentTemplateCategory_orgAddTemplateCategory_tags[];
}

export interface AddDocumentTemplateCategory {
  orgAddTemplateCategory: AddDocumentTemplateCategory_orgAddTemplateCategory;
}

export interface AddDocumentTemplateCategoryVariables {
  category: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateDocumentTemplate
// ====================================================

export interface UpdateDocumentTemplate_orgUpdateTemplate {
  id: any;
}

export interface UpdateDocumentTemplate {
  orgUpdateTemplate: UpdateDocumentTemplate_orgUpdateTemplate;
}

export interface UpdateDocumentTemplateVariables {
  template: DocumentTemplateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddDocumentTemplateTag
// ====================================================

export interface AddDocumentTemplateTag_orgAddTemplateTag {
  tag: string;
}

export interface AddDocumentTemplateTag {
  orgAddTemplateTag: AddDocumentTemplateTag_orgAddTemplateTag;
}

export interface AddDocumentTemplateTagVariables {
  templateTag: DocumentTemplateTagInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveDocumentTemplateTag
// ====================================================

export interface RemoveDocumentTemplateTag {
  orgDeleteTemplateTag: boolean;
}

export interface RemoveDocumentTemplateTagVariables {
  templateTag: DocumentTemplateTagInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateDocumentCategoryTemplate
// ====================================================

export interface UpdateDocumentCategoryTemplate_orgUpdateTemplateCategory {
  id: any;
}

export interface UpdateDocumentCategoryTemplate {
  orgUpdateTemplateCategory: UpdateDocumentCategoryTemplate_orgUpdateTemplateCategory;
}

export interface UpdateDocumentCategoryTemplateVariables {
  category: CategoryInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddDocumentCategoryTag
// ====================================================

export interface AddDocumentCategoryTag_orgAddCategoryTag {
  tag: string;
}

export interface AddDocumentCategoryTag {
  orgAddCategoryTag: AddDocumentCategoryTag_orgAddCategoryTag;
}

export interface AddDocumentCategoryTagVariables {
  categoryTag: CategoryTagInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteDocumentCategoryTag
// ====================================================

export interface DeleteDocumentCategoryTag {
  orgDeleteCategoryTag: boolean;
}

export interface DeleteDocumentCategoryTagVariables {
  categoryTag: CategoryTagInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteDocumentTemplate
// ====================================================

export interface DeleteDocumentTemplate {
  orgDeleteDocumentTemplate: boolean;
}

export interface DeleteDocumentTemplateVariables {
  templateId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteDocumentTemplateCategory
// ====================================================

export interface DeleteDocumentTemplateCategory {
  orgDeleteCategory: boolean;
}

export interface DeleteDocumentTemplateCategoryVariables {
  categoryId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateDocumentVersion
// ====================================================

export interface CreateDocumentVersion_documentCreateVersion {
  id: any;
  rootDocumentId: any;
  versioningDocumentId: any;
  name: string;
}

export interface CreateDocumentVersion {
  documentCreateVersion: CreateDocumentVersion_documentCreateVersion;
}

export interface CreateDocumentVersionVariables {
  name: string;
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RestoreDocumentVersion
// ====================================================

export interface RestoreDocumentVersion_documentApplyHistoryVersion {
  id: any;
}

export interface RestoreDocumentVersion {
  documentApplyHistoryVersion: RestoreDocumentVersion_documentApplyHistoryVersion;
}

export interface RestoreDocumentVersionVariables {
  versionId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateDocumentVersion
// ====================================================

export interface UpdateDocumentVersion_documentUpdateVersion {
  id: any;
}

export interface UpdateDocumentVersion {
  documentUpdateVersion: UpdateDocumentVersion_documentUpdateVersion;
}

export interface UpdateDocumentVersionVariables {
  data: DocumentVersionInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: FileCreate
// ====================================================

export interface FileCreate_fileCreate_file {
  uuid: any;
  userId: number;
  fileName: string;
  contentType: string;
  contentLength: number;
  updatedAt: number;
  createdAt: number;
  public: boolean;
  publicUrl: string | null;
}

export interface FileCreate_fileCreate_uploadInfo {
  fields: any;
  uploadUrl: string;
}

export interface FileCreate_fileCreate {
  file: FileCreate_fileCreate_file;
  uploadInfo: FileCreate_fileCreate_uploadInfo;
}

export interface FileCreate {
  fileCreate: FileCreate_fileCreate;
}

export interface FileCreateVariables {
  data: CreateFileData;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: FileCreateRecording
// ====================================================

export interface FileCreateRecording_fileCreateRecording_file {
  uuid: any;
  userId: number;
  fileName: string;
  contentType: string;
  contentLength: number;
  updatedAt: number;
  createdAt: number;
  public: boolean;
  publicUrl: string | null;
}

export interface FileCreateRecording_fileCreateRecording_uploadInfo {
  fields: any;
  uploadUrl: string;
}

export interface FileCreateRecording_fileCreateRecording {
  file: FileCreateRecording_fileCreateRecording_file;
  uploadInfo: FileCreateRecording_fileCreateRecording_uploadInfo;
}

export interface FileCreateRecording {
  fileCreateRecording: FileCreateRecording_fileCreateRecording;
}

export interface FileCreateRecordingVariables {
  data: CreateFileData;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: FileCheck
// ====================================================

export interface FileCheck {
  fileCheck: boolean;
}

export interface FileCheckVariables {
  fileId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateAssignment
// ====================================================

export interface UpdateAssignment {
  assignmentUpdate: boolean;
}

export interface UpdateAssignmentVariables {
  assignmentId: number;
  data: UpdateAssignmentData;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StartSubmission
// ====================================================

export interface StartSubmission_assignmentStartSubmission {
  id: number;
  documentId: any;
}

export interface StartSubmission {
  assignmentStartSubmission: StartSubmission_assignmentStartSubmission;
}

export interface StartSubmissionVariables {
  assignmentId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StudentRedoSubmission
// ====================================================

export interface StudentRedoSubmission {
  assignmentRedo: boolean;
}

export interface StudentRedoSubmissionVariables {
  submissionId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StudentSubmitSubmission
// ====================================================

export interface StudentSubmitSubmission_assignmentSubmitSubmission {
  id: number;
}

export interface StudentSubmitSubmission {
  assignmentSubmitSubmission: StudentSubmitSubmission_assignmentSubmitSubmission;
}

export interface StudentSubmitSubmissionVariables {
  submissionId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TeacherStartSubmission
// ====================================================

export interface TeacherStartSubmission_assignmentStartByTeacher {
  id: number;
  documentId: any;
}

export interface TeacherStartSubmission {
  assignmentStartByTeacher: TeacherStartSubmission_assignmentStartByTeacher;
}

export interface TeacherStartSubmissionVariables {
  assignmentId: number;
  studentId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TeacherReviewSubmission
// ====================================================

export interface TeacherReviewSubmission {
  assignmentGradeSubmission: boolean;
}

export interface TeacherReviewSubmissionVariables {
  submissionId: number;
  gradeData: GradeSubmissionData;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TeacherRequestRedo
// ====================================================

export interface TeacherRequestRedo {
  assignmentRequestRedo: boolean;
}

export interface TeacherRequestRedoVariables {
  submissionId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpsertRubric
// ====================================================

export interface UpsertRubric_orgUpsertRubric_data_items_userPick {
  selected: boolean;
  score: number;
  comment: string;
}

export interface UpsertRubric_orgUpsertRubric_data_items {
  explanation: string;
  score: number;
  toScore: number;
  userPick: UpsertRubric_orgUpsertRubric_data_items_userPick;
}

export interface UpsertRubric_orgUpsertRubric_data {
  rubricType: RubricType;
  criteria: string[];
  weightingCriteria: (number | null)[];
  level: string[];
  items: UpsertRubric_orgUpsertRubric_data_items[][];
}

export interface UpsertRubric_orgUpsertRubric {
  id: any;
  orgId: number;
  name: string;
  data: UpsertRubric_orgUpsertRubric_data;
  createdAt: number;
}

export interface UpsertRubric {
  orgUpsertRubric: UpsertRubric_orgUpsertRubric;
}

export interface UpsertRubricVariables {
  rubric: RubricInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveRubric
// ====================================================

export interface RemoveRubric {
  orgRemoveRubric: boolean;
}

export interface RemoveRubricVariables {
  rubricId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: GradeRubricSubmission
// ====================================================

export interface GradeRubricSubmission_assignmentUpdateRubricSubmission_gradedData_items_userPick {
  selected: boolean;
  score: number;
  comment: string;
}

export interface GradeRubricSubmission_assignmentUpdateRubricSubmission_gradedData_items {
  explanation: string;
  score: number;
  toScore: number;
  userPick: GradeRubricSubmission_assignmentUpdateRubricSubmission_gradedData_items_userPick;
}

export interface GradeRubricSubmission_assignmentUpdateRubricSubmission_gradedData {
  rubricType: RubricType;
  criteria: string[];
  weightingCriteria: (number | null)[];
  level: string[];
  items: GradeRubricSubmission_assignmentUpdateRubricSubmission_gradedData_items[][];
  totalUserScore: number;
}

export interface GradeRubricSubmission_assignmentUpdateRubricSubmission {
  submissionId: number;
  rubricId: any | null;
  gradedData: GradeRubricSubmission_assignmentUpdateRubricSubmission_gradedData;
}

export interface GradeRubricSubmission {
  assignmentUpdateRubricSubmission: GradeRubricSubmission_assignmentUpdateRubricSubmission;
}

export interface GradeRubricSubmissionVariables {
  data: RubricSubmissionInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateQuizStructure
// ====================================================

export interface CreateQuizStructure_quizCreateStructure {
  id: any;
  userId: number;
  quizType: QuizType;
  quizTitle: string;
  quizBody: any;
  updatedAt: number;
  createdAt: number;
}

export interface CreateQuizStructure {
  quizCreateStructure: CreateQuizStructure_quizCreateStructure;
}

export interface CreateQuizStructureVariables {
  data: QuizStructureInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateQuiz
// ====================================================

export interface CreateQuiz_quizCreate_structure {
  id: any;
  userId: number;
  quizType: QuizType;
  quizTitle: string;
  quizBody: any;
  updatedAt: number;
  createdAt: number;
}

export interface CreateQuiz_quizCreate_myAnswer {
  quizId: any;
  userId: number;
  answer: any;
  isCorrect: boolean | null;
}

export interface CreateQuiz_quizCreate_answers_user_avatar {
  publicUrl: string | null;
}

export interface CreateQuiz_quizCreate_answers_user {
  id: number;
  firstName: string;
  lastName: string;
  avatar: CreateQuiz_quizCreate_answers_user_avatar | null;
  randomColor: string;
}

export interface CreateQuiz_quizCreate_answers {
  quizId: any;
  userId: number;
  answer: any;
  isCorrect: boolean | null;
  user: CreateQuiz_quizCreate_answers_user;
}

export interface CreateQuiz_quizCreate {
  id: any;
  documentId: any;
  deletedAt: number | null;
  structure: CreateQuiz_quizCreate_structure;
  structureAnswer: any;
  structureExplanation: string;
  myAnswer: CreateQuiz_quizCreate_myAnswer | null;
  answers: CreateQuiz_quizCreate_answers[];
}

export interface CreateQuiz {
  quizCreate: CreateQuiz_quizCreate;
}

export interface CreateQuizVariables {
  data: QuizInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateQuizTitle
// ====================================================

export interface UpdateQuizTitle_quizUpdateTitle {
  id: any;
}

export interface UpdateQuizTitle {
  quizUpdateTitle: UpdateQuizTitle_quizUpdateTitle;
}

export interface UpdateQuizTitleVariables {
  quizStructureId: any;
  title: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AnswerQuiz
// ====================================================

export interface AnswerQuiz_quizAnswer {
  quizId: any;
  userId: number;
  answer: any;
}

export interface AnswerQuiz {
  quizAnswer: AnswerQuiz_quizAnswer;
}

export interface AnswerQuizVariables {
  data: QuizAnswerInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CloneQuiz
// ====================================================

export interface CloneQuiz_quizClone_structure {
  id: any;
  userId: number;
  quizType: QuizType;
  quizTitle: string;
  quizBody: any;
  updatedAt: number;
  createdAt: number;
}

export interface CloneQuiz_quizClone_myAnswer {
  quizId: any;
  userId: number;
  answer: any;
  isCorrect: boolean | null;
}

export interface CloneQuiz_quizClone_answers_user_avatar {
  publicUrl: string | null;
}

export interface CloneQuiz_quizClone_answers_user {
  id: number;
  firstName: string;
  lastName: string;
  avatar: CloneQuiz_quizClone_answers_user_avatar | null;
  randomColor: string;
}

export interface CloneQuiz_quizClone_answers {
  quizId: any;
  userId: number;
  answer: any;
  isCorrect: boolean | null;
  user: CloneQuiz_quizClone_answers_user;
}

export interface CloneQuiz_quizClone {
  id: any;
  documentId: any;
  deletedAt: number | null;
  structure: CloneQuiz_quizClone_structure;
  structureAnswer: any;
  structureExplanation: string;
  myAnswer: CloneQuiz_quizClone_myAnswer | null;
  answers: CloneQuiz_quizClone_answers[];
}

export interface CloneQuiz {
  quizClone: CloneQuiz_quizClone;
}

export interface CloneQuizVariables {
  fromQuizId: any;
  toQuizId: any;
  toDocumentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateComment
// ====================================================

export interface CreateComment_addComment_sender_avatar {
  publicUrl: string | null;
}

export interface CreateComment_addComment_sender_orgPersonalInformation_avatar {
  publicUrl: string | null;
}

export interface CreateComment_addComment_sender_orgPersonalInformation {
  fullName: string;
  avatar: CreateComment_addComment_sender_orgPersonalInformation_avatar | null;
}

export interface CreateComment_addComment_sender {
  id: number;
  firstName: string;
  lastName: string;
  avatar: CreateComment_addComment_sender_avatar | null;
  orgPersonalInformation: CreateComment_addComment_sender_orgPersonalInformation | null;
}

export interface CreateComment_addComment {
  id: number;
  createdAt: number;
  content: string;
  commentType: ThreadCommentType;
  sender: CreateComment_addComment_sender;
}

export interface CreateComment {
  addComment: CreateComment_addComment;
}

export interface CreateCommentVariables {
  newComment: NewComment;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteComment
// ====================================================

export interface DeleteComment {
  removeComment: boolean;
}

export interface DeleteCommentVariables {
  commentId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddHighlightDoc
// ====================================================

export interface AddHighlightDoc_documentAddHighlight_thread_creator_avatar {
  publicUrl: string | null;
}

export interface AddHighlightDoc_documentAddHighlight_thread_creator_orgPersonalInformation_avatar {
  publicUrl: string | null;
}

export interface AddHighlightDoc_documentAddHighlight_thread_creator_orgPersonalInformation {
  fullName: string;
  avatar: AddHighlightDoc_documentAddHighlight_thread_creator_orgPersonalInformation_avatar | null;
}

export interface AddHighlightDoc_documentAddHighlight_thread_creator {
  id: number;
  avatar: AddHighlightDoc_documentAddHighlight_thread_creator_avatar | null;
  firstName: string;
  lastName: string;
  orgPersonalInformation: AddHighlightDoc_documentAddHighlight_thread_creator_orgPersonalInformation | null;
}

export interface AddHighlightDoc_documentAddHighlight_thread_comments_sender_avatar {
  publicUrl: string | null;
}

export interface AddHighlightDoc_documentAddHighlight_thread_comments_sender_orgPersonalInformation_avatar {
  publicUrl: string | null;
}

export interface AddHighlightDoc_documentAddHighlight_thread_comments_sender_orgPersonalInformation {
  fullName: string;
  avatar: AddHighlightDoc_documentAddHighlight_thread_comments_sender_orgPersonalInformation_avatar | null;
}

export interface AddHighlightDoc_documentAddHighlight_thread_comments_sender {
  id: number;
  firstName: string;
  lastName: string;
  avatar: AddHighlightDoc_documentAddHighlight_thread_comments_sender_avatar | null;
  orgPersonalInformation: AddHighlightDoc_documentAddHighlight_thread_comments_sender_orgPersonalInformation | null;
}

export interface AddHighlightDoc_documentAddHighlight_thread_comments {
  id: number;
  threadId: number;
  content: string;
  createdAt: number;
  commentType: ThreadCommentType;
  sender: AddHighlightDoc_documentAddHighlight_thread_comments_sender;
}

export interface AddHighlightDoc_documentAddHighlight_thread {
  id: number;
  title: string;
  createdAt: number;
  creator: AddHighlightDoc_documentAddHighlight_thread_creator;
  comments: AddHighlightDoc_documentAddHighlight_thread_comments[];
}

export interface AddHighlightDoc_documentAddHighlight {
  uuid: any;
  documentId: any;
  threadId: number;
  fromPos: number;
  toPos: number;
  thread: AddHighlightDoc_documentAddHighlight_thread;
}

export interface AddHighlightDoc {
  documentAddHighlight: AddHighlightDoc_documentAddHighlight;
}

export interface AddHighlightDocVariables {
  newHighlight: NewDocumentHighlight;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveHighlightDoc
// ====================================================

export interface RemoveHighlightDoc {
  documentRemoveHighlight: boolean;
}

export interface RemoveHighlightDocVariables {
  highlightId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetBandScores
// ====================================================

export interface GetBandScores_assignmentGetBandScores_range_items {
  from: number;
  to: number;
  score: number;
}

export interface GetBandScores_assignmentGetBandScores_range {
  items: GetBandScores_assignmentGetBandScores_range_items[];
}

export interface GetBandScores_assignmentGetBandScores {
  id: number;
  name: string;
  range: GetBandScores_assignmentGetBandScores_range;
  orgId: number | null;
  updatedAt: number;
  createdAt: number;
}

export interface GetBandScores {
  assignmentGetBandScores: GetBandScores_assignmentGetBandScores[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSubmissionsOfAssignment
// ====================================================

export interface GetSubmissionsOfAssignment_documentGet_assignment_submissions_user_avatar {
  publicUrl: string | null;
}

export interface GetSubmissionsOfAssignment_documentGet_assignment_submissions_user {
  id: number;
  firstName: string;
  lastName: string;
  avatar: GetSubmissionsOfAssignment_documentGet_assignment_submissions_user_avatar | null;
  randomColor: string;
}

export interface GetSubmissionsOfAssignment_documentGet_assignment_submissions {
  id: number;
  allowForStudentViewAnswer: boolean;
  userId: number;
  grade: number | null;
  feedback: string | null;
  documentId: any;
  finalGrade: number | null;
  updatedAt: number;
  createdAt: number;
  startAt: number;
  submitAt: number | null;
  isSubmitted: boolean;
  feedbackAt: number | null;
  user: GetSubmissionsOfAssignment_documentGet_assignment_submissions_user;
}

export interface GetSubmissionsOfAssignment_documentGet_assignment {
  id: number;
  submissions: GetSubmissionsOfAssignment_documentGet_assignment_submissions[];
}

export interface GetSubmissionsOfAssignment_documentGet {
  id: any;
  hideRule: HideRule;
  assignment: GetSubmissionsOfAssignment_documentGet_assignment | null;
}

export interface GetSubmissionsOfAssignment {
  documentGet: GetSubmissionsOfAssignment_documentGet;
}

export interface GetSubmissionsOfAssignmentVariables {
  assignmentDocumentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetRubrics
// ====================================================

export interface GetRubrics_orgGetRubrics_data_items_userPick {
  selected: boolean;
  score: number;
  comment: string;
}

export interface GetRubrics_orgGetRubrics_data_items {
  explanation: string;
  score: number;
  toScore: number;
  userPick: GetRubrics_orgGetRubrics_data_items_userPick;
}

export interface GetRubrics_orgGetRubrics_data {
  rubricType: RubricType;
  criteria: string[];
  weightingCriteria: (number | null)[];
  level: string[];
  items: GetRubrics_orgGetRubrics_data_items[][];
}

export interface GetRubrics_orgGetRubrics {
  id: any;
  orgId: number;
  name: string;
  data: GetRubrics_orgGetRubrics_data;
  createdAt: number;
}

export interface GetRubrics {
  orgGetRubrics: GetRubrics_orgGetRubrics[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDocuments
// ====================================================

export interface GetDocuments_spaceGet_documents_assignment {
  id: number;
}

export interface GetDocuments_spaceGet_documents_submission {
  id: number;
}

export interface GetDocuments_spaceGet_documents {
  id: any;
  title: string;
  createdAt: number;
  parentId: any | null;
  index: number;
  documentType: DocumentType;
  hideRule: HideRule;
  deletedAt: number | null;
  assignment: GetDocuments_spaceGet_documents_assignment | null;
  submission: GetDocuments_spaceGet_documents_submission | null;
}

export interface GetDocuments_spaceGet {
  id: number;
  documents: GetDocuments_spaceGet_documents[];
}

export interface GetDocuments {
  spaceGet: GetDocuments_spaceGet;
}

export interface GetDocumentsVariables {
  spaceId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSpaceMembers
// ====================================================

export interface GetSpaceMembers_spaceGet_members_user_orgMember {
  orgRole: OrgRole;
}

export interface GetSpaceMembers_spaceGet_members_user_orgPersonalInformation_avatar {
  publicUrl: string | null;
}

export interface GetSpaceMembers_spaceGet_members_user_orgPersonalInformation {
  fullName: string;
  avatar: GetSpaceMembers_spaceGet_members_user_orgPersonalInformation_avatar | null;
}

export interface GetSpaceMembers_spaceGet_members_user_avatar {
  publicUrl: string | null;
}

export interface GetSpaceMembers_spaceGet_members_user {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  randomColor: string;
  orgMember: GetSpaceMembers_spaceGet_members_user_orgMember | null;
  orgPersonalInformation: GetSpaceMembers_spaceGet_members_user_orgPersonalInformation | null;
  avatar: GetSpaceMembers_spaceGet_members_user_avatar | null;
}

export interface GetSpaceMembers_spaceGet_members {
  userId: number;
  spaceId: number;
  createdAt: number;
  user: GetSpaceMembers_spaceGet_members_user;
}

export interface GetSpaceMembers_spaceGet {
  id: number;
  members: GetSpaceMembers_spaceGet_members[];
}

export interface GetSpaceMembers {
  spaceGet: GetSpaceMembers_spaceGet;
}

export interface GetSpaceMembersVariables {
  spaceId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetBasicSpaceDetail
// ====================================================

export interface GetBasicSpaceDetail_spaceGet_banner {
  publicUrl: string | null;
}

export interface GetBasicSpaceDetail_spaceGet {
  id: number;
  name: string;
  banner: GetBasicSpaceDetail_spaceGet_banner | null;
}

export interface GetBasicSpaceDetail {
  spaceGet: GetBasicSpaceDetail_spaceGet;
}

export interface GetBasicSpaceDetailVariables {
  spaceId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDeletedSpaces
// ====================================================

export interface GetDeletedSpaces_spaceGetDeletedSpaces_banner {
  publicUrl: string | null;
}

export interface GetDeletedSpaces_spaceGetDeletedSpaces {
  id: number;
  name: string;
  deletedAt: number | null;
  banner: GetDeletedSpaces_spaceGetDeletedSpaces_banner | null;
}

export interface GetDeletedSpaces {
  spaceGetDeletedSpaces: GetDeletedSpaces_spaceGetDeletedSpaces[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOrgSpaces
// ====================================================

export interface GetOrgSpaces_spaceGetAllOrgSpaces {
  id: number;
  name: string;
}

export interface GetOrgSpaces {
  spaceGetAllOrgSpaces: GetOrgSpaces_spaceGetAllOrgSpaces[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDocumentDetail
// ====================================================

export interface GetDocumentDetail_documentGet_quizzes_structure {
  id: any;
  userId: number;
  quizType: QuizType;
  quizTitle: string;
  quizBody: any;
  updatedAt: number;
  createdAt: number;
}

export interface GetDocumentDetail_documentGet_quizzes_myAnswer {
  quizId: any;
  userId: number;
  answer: any;
  isCorrect: boolean | null;
}

export interface GetDocumentDetail_documentGet_quizzes_answers_user_avatar {
  publicUrl: string | null;
}

export interface GetDocumentDetail_documentGet_quizzes_answers_user {
  id: number;
  firstName: string;
  lastName: string;
  avatar: GetDocumentDetail_documentGet_quizzes_answers_user_avatar | null;
  randomColor: string;
}

export interface GetDocumentDetail_documentGet_quizzes_answers {
  quizId: any;
  userId: number;
  answer: any;
  isCorrect: boolean | null;
  user: GetDocumentDetail_documentGet_quizzes_answers_user;
}

export interface GetDocumentDetail_documentGet_quizzes {
  id: any;
  documentId: any;
  deletedAt: number | null;
  structure: GetDocumentDetail_documentGet_quizzes_structure;
  structureAnswer: any;
  structureExplanation: string;
  myAnswer: GetDocumentDetail_documentGet_quizzes_myAnswer | null;
  answers: GetDocumentDetail_documentGet_quizzes_answers[];
}

export interface GetDocumentDetail_documentGet_submission_user_avatar {
  publicUrl: string | null;
}

export interface GetDocumentDetail_documentGet_submission_user_orgPersonalInformation_avatar {
  publicUrl: string | null;
}

export interface GetDocumentDetail_documentGet_submission_user_orgPersonalInformation {
  fullName: string;
  avatar: GetDocumentDetail_documentGet_submission_user_orgPersonalInformation_avatar | null;
}

export interface GetDocumentDetail_documentGet_submission_user {
  id: number;
  firstName: string;
  lastName: string;
  avatar: GetDocumentDetail_documentGet_submission_user_avatar | null;
  randomColor: string;
  orgPersonalInformation: GetDocumentDetail_documentGet_submission_user_orgPersonalInformation | null;
}

export interface GetDocumentDetail_documentGet_submission_assignment_document {
  id: any;
  spaceId: number | null;
}

export interface GetDocumentDetail_documentGet_submission_assignment {
  id: number;
  bandScoreId: number | null;
  testDuration: number | null;
  documentId: any;
  gradeByRubricId: any | null;
  document: GetDocumentDetail_documentGet_submission_assignment_document;
}

export interface GetDocumentDetail_documentGet_submission_rubricGrade_gradedData_items_userPick {
  selected: boolean;
  score: number;
  comment: string;
}

export interface GetDocumentDetail_documentGet_submission_rubricGrade_gradedData_items {
  explanation: string;
  score: number;
  toScore: number;
  userPick: GetDocumentDetail_documentGet_submission_rubricGrade_gradedData_items_userPick;
}

export interface GetDocumentDetail_documentGet_submission_rubricGrade_gradedData {
  rubricType: RubricType;
  criteria: string[];
  weightingCriteria: (number | null)[];
  level: string[];
  items: GetDocumentDetail_documentGet_submission_rubricGrade_gradedData_items[][];
  totalUserScore: number;
}

export interface GetDocumentDetail_documentGet_submission_rubricGrade {
  submissionId: number;
  rubricId: any | null;
  gradedData: GetDocumentDetail_documentGet_submission_rubricGrade_gradedData;
}

export interface GetDocumentDetail_documentGet_submission {
  id: number;
  userId: number;
  grade: number | null;
  finalGrade: number | null;
  feedback: string | null;
  isSubmitted: boolean;
  updatedAt: number;
  createdAt: number;
  startAt: number;
  submitAt: number | null;
  allowForStudentViewAnswer: boolean;
  allowRework: boolean;
  canChangeStructure: boolean;
  user: GetDocumentDetail_documentGet_submission_user;
  assignment: GetDocumentDetail_documentGet_submission_assignment;
  rubricGrade: GetDocumentDetail_documentGet_submission_rubricGrade | null;
}

export interface GetDocumentDetail_documentGet_assignment_rubric_data_items_userPick {
  selected: boolean;
  score: number;
  comment: string;
}

export interface GetDocumentDetail_documentGet_assignment_rubric_data_items {
  explanation: string;
  score: number;
  toScore: number;
  userPick: GetDocumentDetail_documentGet_assignment_rubric_data_items_userPick;
}

export interface GetDocumentDetail_documentGet_assignment_rubric_data {
  rubricType: RubricType;
  criteria: string[];
  weightingCriteria: (number | null)[];
  level: string[];
  items: GetDocumentDetail_documentGet_assignment_rubric_data_items[][];
}

export interface GetDocumentDetail_documentGet_assignment_rubric {
  id: any;
  orgId: number;
  name: string;
  data: GetDocumentDetail_documentGet_assignment_rubric_data;
  createdAt: number;
}

export interface GetDocumentDetail_documentGet_assignment_submissions_user_avatar {
  publicUrl: string | null;
}

export interface GetDocumentDetail_documentGet_assignment_submissions_user {
  id: number;
  firstName: string;
  lastName: string;
  avatar: GetDocumentDetail_documentGet_assignment_submissions_user_avatar | null;
  randomColor: string;
}

export interface GetDocumentDetail_documentGet_assignment_submissions {
  id: number;
  allowForStudentViewAnswer: boolean;
  userId: number;
  grade: number | null;
  feedback: string | null;
  documentId: any;
  finalGrade: number | null;
  updatedAt: number;
  createdAt: number;
  startAt: number;
  submitAt: number | null;
  isSubmitted: boolean;
  feedbackAt: number | null;
  user: GetDocumentDetail_documentGet_assignment_submissions_user;
}

export interface GetDocumentDetail_documentGet_assignment_mySubmission {
  id: number;
  userId: number;
  feedback: string | null;
  documentId: any;
  attemptNumber: number;
  finalGrade: number | null;
  feedbackAt: number | null;
  submitAt: number | null;
  allowRework: boolean;
}

export interface GetDocumentDetail_documentGet_assignment {
  id: number;
  gradedType: GradeType;
  gradeMethod: GradeMethod;
  preDescription: string | null;
  maxNumberOfAttempt: number | null;
  testDuration: number | null;
  bandScoreId: number | null;
  allowSubmissionChangeStructure: boolean;
  gradeByRubricId: any | null;
  weightingIntoFinalGrade: number;
  rubric: GetDocumentDetail_documentGet_assignment_rubric | null;
  submissions: GetDocumentDetail_documentGet_assignment_submissions[];
  mySubmission: GetDocumentDetail_documentGet_assignment_mySubmission | null;
}

export interface GetDocumentDetail_documentGet {
  id: any;
  body: string;
  title: string;
  isPublic: boolean;
  hideRule: HideRule;
  coverPhotoId: any | null;
  coverPhotoUrl: string | null;
  editorConfig: any;
  updatedAt: number;
  deletedAt: number | null;
  spaceId: number | null;
  quizzes: GetDocumentDetail_documentGet_quizzes[];
  submission: GetDocumentDetail_documentGet_submission | null;
  assignment: GetDocumentDetail_documentGet_assignment | null;
}

export interface GetDocumentDetail {
  documentGet: GetDocumentDetail_documentGet;
}

export interface GetDocumentDetailVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPageBlocks
// ====================================================

export interface GetPageBlocks_documentGet_pageBlocks_nestedDocuments_document {
  id: any;
  body: string;
}

export interface GetPageBlocks_documentGet_pageBlocks_nestedDocuments {
  pageBlockId: any;
  documentId: any;
  index: number;
  document: GetPageBlocks_documentGet_pageBlocks_nestedDocuments_document;
}

export interface GetPageBlocks_documentGet_pageBlocks {
  id: any;
  documentId: any;
  title: string;
  nestedDocuments: GetPageBlocks_documentGet_pageBlocks_nestedDocuments[];
}

export interface GetPageBlocks_documentGet {
  id: any;
  body: string;
  pageBlocks: GetPageBlocks_documentGet_pageBlocks[];
}

export interface GetPageBlocks {
  documentGet: GetPageBlocks_documentGet;
}

export interface GetPageBlocksVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDocumentDetailByUUID
// ====================================================

export interface GetDocumentDetailByUUID_documentGet_quizzes_myAnswer {
  answer: any;
}

export interface GetDocumentDetailByUUID_documentGet_quizzes {
  id: any;
  myAnswer: GetDocumentDetailByUUID_documentGet_quizzes_myAnswer | null;
}

export interface GetDocumentDetailByUUID_documentGet {
  id: any;
  body: string;
  title: string;
  isPublic: boolean;
  coverPhotoUrl: string | null;
  editorConfig: any;
  quizzes: GetDocumentDetailByUUID_documentGet_quizzes[];
}

export interface GetDocumentDetailByUUID {
  documentGet: GetDocumentDetailByUUID_documentGet;
}

export interface GetDocumentDetailByUUIDVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDeletedDocuments
// ====================================================

export interface GetDeletedDocuments_documentGetDeletedDocuments {
  id: any;
  title: string;
  deletedAt: number | null;
  coverPhotoUrl: string | null;
}

export interface GetDeletedDocuments {
  documentGetDeletedDocuments: GetDeletedDocuments_documentGetDeletedDocuments[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCommunityTemplateCategory
// ====================================================

export interface GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories_tags {
  tag: string;
}

export interface GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories {
  id: any;
  name: string;
  orgId: number;
  orgInternalIndex: number | null;
  isCommunity: boolean;
  communityIndex: number | null;
  tags: GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories_tags[];
}

export interface GetCommunityTemplateCategory {
  getCommunityDocumentTemplateCategories: GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCommunityTemplates
// ====================================================

export interface GetCommunityTemplates_getCommunityDocumentTemplates_creator_avatar {
  publicUrl: string | null;
}

export interface GetCommunityTemplates_getCommunityDocumentTemplates_creator {
  id: number;
  firstName: string;
  lastName: string;
  avatar: GetCommunityTemplates_getCommunityDocumentTemplates_creator_avatar | null;
  randomColor: string;
}

export interface GetCommunityTemplates_getCommunityDocumentTemplates_tags {
  tag: string;
}

export interface GetCommunityTemplates_getCommunityDocumentTemplates {
  id: any;
  name: string;
  documentId: any;
  isPublished: boolean;
  orgId: number;
  createdBy: number | null;
  creator: GetCommunityTemplates_getCommunityDocumentTemplates_creator | null;
  tags: GetCommunityTemplates_getCommunityDocumentTemplates_tags[];
}

export interface GetCommunityTemplates {
  getCommunityDocumentTemplates: GetCommunityTemplates_getCommunityDocumentTemplates[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOrgTemplateCategory
// ====================================================

export interface GetOrgTemplateCategory_orgGetDocumentTemplateCategories_tags {
  tag: string;
}

export interface GetOrgTemplateCategory_orgGetDocumentTemplateCategories {
  id: any;
  name: string;
  orgId: number;
  orgInternalIndex: number | null;
  isCommunity: boolean;
  communityIndex: number | null;
  tags: GetOrgTemplateCategory_orgGetDocumentTemplateCategories_tags[];
}

export interface GetOrgTemplateCategory {
  orgGetDocumentTemplateCategories: GetOrgTemplateCategory_orgGetDocumentTemplateCategories[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOrgTemplates
// ====================================================

export interface GetOrgTemplates_orgGetDocumentTemplates_creator_avatar {
  publicUrl: string | null;
}

export interface GetOrgTemplates_orgGetDocumentTemplates_creator {
  id: number;
  firstName: string;
  lastName: string;
  avatar: GetOrgTemplates_orgGetDocumentTemplates_creator_avatar | null;
  randomColor: string;
}

export interface GetOrgTemplates_orgGetDocumentTemplates_tags {
  tag: string;
}

export interface GetOrgTemplates_orgGetDocumentTemplates {
  id: any;
  name: string;
  documentId: any;
  isPublished: boolean;
  orgId: number;
  createdBy: number | null;
  creator: GetOrgTemplates_orgGetDocumentTemplates_creator | null;
  tags: GetOrgTemplates_orgGetDocumentTemplates_tags[];
}

export interface GetOrgTemplates {
  orgGetDocumentTemplates: GetOrgTemplates_orgGetDocumentTemplates[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOrgTags
// ====================================================

export interface GetOrgTags_orgGetTags {
  name: string;
}

export interface GetOrgTags {
  orgGetTags: GetOrgTags_orgGetTags[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDocumentHistoryVersions
// ====================================================

export interface GetDocumentHistoryVersions_documentGetHistoryVersions_createdBy {
  id: number;
  firstName: string;
  lastName: string;
}

export interface GetDocumentHistoryVersions_documentGetHistoryVersions {
  id: any;
  rootDocumentId: any;
  versioningDocumentId: any;
  name: string;
  creatorId: number | null;
  createdAt: number;
  createdBy: GetDocumentHistoryVersions_documentGetHistoryVersions_createdBy | null;
}

export interface GetDocumentHistoryVersions {
  documentGetHistoryVersions: GetDocumentHistoryVersions_documentGetHistoryVersions[];
}

export interface GetDocumentHistoryVersionsVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDownloadTranscodingUrl
// ====================================================

export interface GetDownloadTranscodingUrl {
  fileGetDownloadTranscodingUrl: string | null;
}

export interface GetDownloadTranscodingUrlVariables {
  fileId: any;
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetFullFileInfo
// ====================================================

export interface GetFullFileInfo_getFile {
  uuid: any;
  downloadUrlByDocumentId: string | null;
  contentType: string;
  contentLength: number;
  transcodingOutputKey: string | null;
  transcodingOutputContentType: string | null;
  transcodingOutputContentLength: number | null;
}

export interface GetFullFileInfo {
  getFile: GetFullFileInfo_getFile;
}

export interface GetFullFileInfoVariables {
  fileId: any;
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAudioWaveform
// ====================================================

export interface GetAudioWaveform {
  fileWaveform: string | null;
}

export interface GetAudioWaveformVariables {
  fileId: any;
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetQuizStats
// ====================================================

export interface GetQuizStats_quizGetStats {
  options: string[];
  countAnswers: number[];
}

export interface GetQuizStats {
  quizGetStats: GetQuizStats_quizGetStats | null;
}

export interface GetQuizStatsVariables {
  quizId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAnswersOfStructure
// ====================================================

export interface GetAnswersOfStructure_quizGetAllStructureAnswers {
  quizId: any;
  userId: number;
  answer: any;
}

export interface GetAnswersOfStructure {
  quizGetAllStructureAnswers: GetAnswersOfStructure_quizGetAllStructureAnswers[];
}

export interface GetAnswersOfStructureVariables {
  quizStructureId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetHighlightDocument
// ====================================================

export interface GetHighlightDocument_documentGet_highlights_thread_creator_avatar {
  publicUrl: string | null;
}

export interface GetHighlightDocument_documentGet_highlights_thread_creator_orgPersonalInformation_avatar {
  publicUrl: string | null;
}

export interface GetHighlightDocument_documentGet_highlights_thread_creator_orgPersonalInformation {
  fullName: string;
  avatar: GetHighlightDocument_documentGet_highlights_thread_creator_orgPersonalInformation_avatar | null;
}

export interface GetHighlightDocument_documentGet_highlights_thread_creator {
  id: number;
  avatar: GetHighlightDocument_documentGet_highlights_thread_creator_avatar | null;
  firstName: string;
  lastName: string;
  orgPersonalInformation: GetHighlightDocument_documentGet_highlights_thread_creator_orgPersonalInformation | null;
}

export interface GetHighlightDocument_documentGet_highlights_thread_comments_sender_avatar {
  publicUrl: string | null;
}

export interface GetHighlightDocument_documentGet_highlights_thread_comments_sender_orgPersonalInformation_avatar {
  publicUrl: string | null;
}

export interface GetHighlightDocument_documentGet_highlights_thread_comments_sender_orgPersonalInformation {
  fullName: string;
  avatar: GetHighlightDocument_documentGet_highlights_thread_comments_sender_orgPersonalInformation_avatar | null;
}

export interface GetHighlightDocument_documentGet_highlights_thread_comments_sender {
  id: number;
  avatar: GetHighlightDocument_documentGet_highlights_thread_comments_sender_avatar | null;
  firstName: string;
  lastName: string;
  orgPersonalInformation: GetHighlightDocument_documentGet_highlights_thread_comments_sender_orgPersonalInformation | null;
}

export interface GetHighlightDocument_documentGet_highlights_thread_comments {
  id: number;
  createdAt: number;
  content: string;
  commentType: ThreadCommentType;
  sender: GetHighlightDocument_documentGet_highlights_thread_comments_sender;
}

export interface GetHighlightDocument_documentGet_highlights_thread {
  id: number;
  title: string;
  createdAt: number;
  creator: GetHighlightDocument_documentGet_highlights_thread_creator;
  comments: GetHighlightDocument_documentGet_highlights_thread_comments[];
}

export interface GetHighlightDocument_documentGet_highlights {
  threadId: number;
  uuid: any;
  fromPos: number;
  toPos: number;
  thread: GetHighlightDocument_documentGet_highlights_thread;
}

export interface GetHighlightDocument_documentGet {
  id: any;
  highlights: GetHighlightDocument_documentGet_highlights[];
}

export interface GetHighlightDocument {
  documentGet: GetHighlightDocument_documentGet;
}

export interface GetHighlightDocumentVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserMe
// ====================================================

export interface UserMe_userMe_avatar {
  publicUrl: string | null;
}

export interface UserMe_userMe_members_organization {
  id: number;
  orgName: string;
  ownerId: number | null;
}

export interface UserMe_userMe_members {
  userId: number;
  orgId: number;
  orgRole: OrgRole;
  organization: UserMe_userMe_members_organization;
}

export interface UserMe_userMe_activeUserAuth {
  orgId: number;
  orgRole: OrgRole;
}

export interface UserMe_userMe {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: number;
  randomColor: string;
  avatarFileId: any | null;
  avatar: UserMe_userMe_avatar | null;
  members: UserMe_userMe_members[];
  activeUserAuth: UserMe_userMe_activeUserAuth | null;
}

export interface UserMe {
  userMe: UserMe_userMe;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: SubmissionSubscribe
// ====================================================

export interface SubmissionSubscribe_submissionSubscribe {
  submissionId: number;
  eventType: SubmissionEventType;
}

export interface SubmissionSubscribe {
  submissionSubscribe: SubmissionSubscribe_submissionSubscribe;
}

export interface SubmissionSubscribeVariables {
  submissionId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum DocumentType {
  ASSIGNMENT = "ASSIGNMENT",
  NORMAL = "NORMAL",
}

export enum GradeMethod {
  AUTO_GRADE = "AUTO_GRADE",
  MANUAL = "MANUAL",
  RUBRIC = "RUBRIC",
}

export enum GradeType {
  GRADE = "GRADE",
  NON_GRADE = "NON_GRADE",
}

export enum HideRule {
  PRIVATE = "PRIVATE",
  PUBLIC = "PUBLIC",
}

export enum HighlightType {
  NORMAL = "NORMAL",
  REPLACE = "REPLACE",
}

export enum OrgRole {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
}

export enum PageViewMode {
  SINGLE = "SINGLE",
  SPLIT = "SPLIT",
}

export enum QuizType {
  FILL_IN_BLANK = "FILL_IN_BLANK",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  SELECT_OPTION = "SELECT_OPTION",
  SINGLE_CHOICE = "SINGLE_CHOICE",
}

export enum RubricType {
  POINT_BASED = "POINT_BASED",
  POINT_RANGE = "POINT_RANGE",
}

export enum SubmissionEventType {
  SUBMIT_COMPLETED = "SUBMIT_COMPLETED",
}

export enum ThreadCommentType {
  FILE = "FILE",
  TEXT = "TEXT",
}

export interface CategoryInput {
  id: any;
  name: string;
  orgInternalIndex?: number | null;
}

export interface CategoryTagInput {
  categoryId: any;
  tag: string;
}

export interface CreateFileData {
  fileName: string;
  contentType: string;
  contentLength: number;
  public: boolean;
}

export interface DocumentTemplateInput {
  id: any;
  name: string;
}

export interface DocumentTemplateTagInput {
  documentTemplateId: any;
  tag: string;
}

export interface DocumentVersionInput {
  id: any;
  name: string;
}

export interface GradeSubmissionData {
  tempGrade?: number | null;
  finalGrade?: number | null;
  feedback?: string | null;
}

export interface NewComment {
  threadId: number;
  content: string;
  commentType: ThreadCommentType;
  fileUuid?: any | null;
}

export interface NewDocument {
  parentId?: any | null;
  coverPhotoId?: any | null;
  index: number;
  title: string;
  body: string;
  editorConfig: any;
  spaceId?: number | null;
}

export interface NewDocumentHighlight {
  documentId: any;
  fromPos: number;
  toPos: number;
  uuid: any;
  highlightType: HighlightType;
  originalText: string;
}

export interface NewSpace {
  name: string;
}

export interface PageBlockDocumentInput {
  pageBlockId: any;
  documentId: any;
  index: number;
  createdAt: number;
}

export interface PageBlockInput {
  id: any;
  documentId: any;
  title: string;
  viewMode: PageViewMode;
}

export interface QuizAnswerInput {
  quizId: any;
  answer: any;
}

export interface QuizInput {
  id: any;
  documentId: any;
  quizStructureId: any;
}

export interface QuizStructureInput {
  id: any;
  quizType: QuizType;
  quizTitle: string;
  quizBody: any;
  quizAnswer: any;
  explanation: string;
}

export interface RubricInput {
  id: any;
  orgId: number;
  name: string;
  data: RubricTableDataInput;
}

export interface RubricSubmissionInput {
  submissionId: number;
  rubricId?: any | null;
  gradedData: RubricTableDataInput;
}

export interface RubricTableDataInput {
  rubricType: RubricType;
  criteria: string[];
  weightingCriteria: (number | null)[];
  level: string[];
  items: RubricTableItemInput[][];
}

export interface RubricTableItemInput {
  explanation: string;
  score: number;
  toScore: number;
  userPick: RubricUserPickedInput;
}

export interface RubricUserPickedInput {
  selected: boolean;
  score: number;
  comment: string;
}

export interface UpdateAssignmentData {
  gradedType: GradeType;
  maxNumberOfAttempt?: number | null;
  preDescription?: string | null;
  testDuration?: number | null;
  bandScoreId?: number | null;
  gradeMethod: GradeMethod;
  forceAutoSubmit: boolean;
  allowSubmissionChangeStructure: boolean;
  gradeByRubricId?: any | null;
  weightingIntoFinalGrade: number;
}

export interface UpdateDocumentData {
  title: string;
  body: string;
  coverPhotoId?: any | null;
  editorConfig: any;
}

export interface UpdatePositionData {
  id: any;
  parentId?: any | null;
  index: number;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
