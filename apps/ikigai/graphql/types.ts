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
// GraphQL mutation operation: AssignToDocument
// ====================================================

export interface AssignToDocument_documentAssignUsers_user_avatar {
  publicUrl: string | null;
}

export interface AssignToDocument_documentAssignUsers_user {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  avatar: AssignToDocument_documentAssignUsers_user_avatar | null;
  randomColor: string;
  email: string;
}

export interface AssignToDocument_documentAssignUsers {
  assignedUserId: number;
  user: AssignToDocument_documentAssignUsers_user;
}

export interface AssignToDocument {
  documentAssignUsers: AssignToDocument_documentAssignUsers[];
}

export interface AssignToDocumentVariables {
  documentId: any;
  emails: string[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveDocumentAssigned
// ====================================================

export interface RemoveDocumentAssigned {
  documentRemoveAssignedUser: boolean;
}

export interface RemoveDocumentAssignedVariables {
  assignedUser: NewDocumentAssignedUserInput;
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

export interface UpsertRubric_userUpsertRubric_data_items_userPick {
  selected: boolean;
  score: number;
  comment: string;
}

export interface UpsertRubric_userUpsertRubric_data_items {
  explanation: string;
  score: number;
  toScore: number;
  userPick: UpsertRubric_userUpsertRubric_data_items_userPick;
}

export interface UpsertRubric_userUpsertRubric_data {
  rubricType: RubricType;
  criteria: string[];
  weightingCriteria: (number | null)[];
  level: string[];
  items: UpsertRubric_userUpsertRubric_data_items[][];
}

export interface UpsertRubric_userUpsertRubric {
  id: any;
  name: string;
  data: UpsertRubric_userUpsertRubric_data;
  createdAt: number;
}

export interface UpsertRubric {
  userUpsertRubric: UpsertRubric_userUpsertRubric;
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
  userRemoveRubric: boolean;
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
// GraphQL mutation operation: UpdateSpace
// ====================================================

export interface UpdateSpace {
  spaceUpdate: boolean;
}

export interface UpdateSpaceVariables {
  spaceId: number;
  data: UpdateSpaceData;
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
// GraphQL mutation operation: GenerateSpaceInviteToken
// ====================================================

export interface GenerateSpaceInviteToken_spaceGenerateInviteToken {
  spaceId: number;
  token: string;
}

export interface GenerateSpaceInviteToken {
  spaceGenerateInviteToken: GenerateSpaceInviteToken_spaceGenerateInviteToken;
}

export interface GenerateSpaceInviteTokenVariables {
  data: SpaceInviteTokenInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteSpaceInviteToken
// ====================================================

export interface DeleteSpaceInviteToken {
  spaceRemoveInviteToken: boolean;
}

export interface DeleteSpaceInviteTokenVariables {
  spaceId: number;
  inviteToken: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JoinSpaceByInviteToken
// ====================================================

export interface JoinSpaceByInviteToken_spaceJoinByInviteToken_starterDocument {
  id: any;
}

export interface JoinSpaceByInviteToken_spaceJoinByInviteToken {
  starterDocument: JoinSpaceByInviteToken_spaceJoinByInviteToken_starterDocument;
  accessToken: string;
}

export interface JoinSpaceByInviteToken {
  spaceJoinByInviteToken: JoinSpaceByInviteToken_spaceJoinByInviteToken;
}

export interface JoinSpaceByInviteTokenVariables {
  email: string;
  spaceId: number;
  token: string;
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

export interface CreateComment_addComment_sender {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  randomColor: string;
  avatar: CreateComment_addComment_sender_avatar | null;
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

export interface AddHighlightDoc_documentAddHighlight_thread_creator {
  id: number;
  avatar: AddHighlightDoc_documentAddHighlight_thread_creator_avatar | null;
  firstName: string;
  lastName: string;
  name: string;
  randomColor: string;
}

export interface AddHighlightDoc_documentAddHighlight_thread_comments_sender_avatar {
  publicUrl: string | null;
}

export interface AddHighlightDoc_documentAddHighlight_thread_comments_sender {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  randomColor: string;
  avatar: AddHighlightDoc_documentAddHighlight_thread_comments_sender_avatar | null;
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
// GraphQL mutation operation: SendMagicLink
// ====================================================

export interface SendMagicLink {
  userGenerateMagicLink: boolean;
}

export interface SendMagicLinkVariables {
  email: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: VerifyMagicLink
// ====================================================

export interface VerifyMagicLink_userCheckMagicLink_user {
  id: number;
}

export interface VerifyMagicLink_userCheckMagicLink {
  user: VerifyMagicLink_userCheckMagicLink_user;
  accessToken: string;
}

export interface VerifyMagicLink {
  userCheckMagicLink: VerifyMagicLink_userCheckMagicLink;
}

export interface VerifyMagicLinkVariables {
  userId: number;
  otp: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateProfile
// ====================================================

export interface UpdateProfile {
  userUpdateInfo: boolean;
}

export interface UpdateProfileVariables {
  input: UpdateUserData;
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

export interface GetRubrics_userGetMyRubrics_data_items_userPick {
  selected: boolean;
  score: number;
  comment: string;
}

export interface GetRubrics_userGetMyRubrics_data_items {
  explanation: string;
  score: number;
  toScore: number;
  userPick: GetRubrics_userGetMyRubrics_data_items_userPick;
}

export interface GetRubrics_userGetMyRubrics_data {
  rubricType: RubricType;
  criteria: string[];
  weightingCriteria: (number | null)[];
  level: string[];
  items: GetRubrics_userGetMyRubrics_data_items[][];
}

export interface GetRubrics_userGetMyRubrics {
  id: any;
  name: string;
  data: GetRubrics_userGetMyRubrics_data;
  createdAt: number;
}

export interface GetRubrics {
  userGetMyRubrics: GetRubrics_userGetMyRubrics[];
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

export interface GetDocumentDetail_documentGet_submission_user {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  avatar: GetDocumentDetail_documentGet_submission_user_avatar | null;
  randomColor: string;
}

export interface GetDocumentDetail_documentGet_submission_assignment {
  id: number;
  bandScoreId: number | null;
  testDuration: number | null;
  documentId: any;
  gradeByRubricId: any | null;
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
// GraphQL query operation: GetDocumentAssignedUsers
// ====================================================

export interface GetDocumentAssignedUsers_documentGet_assignedUsers_user_avatar {
  publicUrl: string | null;
}

export interface GetDocumentAssignedUsers_documentGet_assignedUsers_user {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  avatar: GetDocumentAssignedUsers_documentGet_assignedUsers_user_avatar | null;
  randomColor: string;
  email: string;
}

export interface GetDocumentAssignedUsers_documentGet_assignedUsers {
  assignedUserId: number;
  user: GetDocumentAssignedUsers_documentGet_assignedUsers_user;
}

export interface GetDocumentAssignedUsers_documentGet {
  id: any;
  assignedUsers: GetDocumentAssignedUsers_documentGet_assignedUsers[];
}

export interface GetDocumentAssignedUsers {
  documentGet: GetDocumentAssignedUsers_documentGet;
}

export interface GetDocumentAssignedUsersVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDocumentV2
// ====================================================

export interface GetDocumentV2_documentGet {
  id: any;
  body: string;
  title: string;
  isPublic: boolean;
  coverPhotoId: any | null;
  coverPhotoUrl: string | null;
  editorConfig: any;
  updatedAt: number;
  deletedAt: number | null;
  spaceId: number | null;
  iconType: IconType | null;
  iconValue: string | null;
}

export interface GetDocumentV2 {
  documentGet: GetDocumentV2_documentGet;
}

export interface GetDocumentV2Variables {
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
  deletedAt: number | null;
  iconType: IconType | null;
  iconValue: string | null;
  assignment: GetDocuments_spaceGet_documents_assignment | null;
  submission: GetDocuments_spaceGet_documents_submission | null;
}

export interface GetDocuments_spaceGet {
  id: number;
  name: string;
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

export interface GetSpaceMembers_spaceGet_members_user_avatar {
  publicUrl: string | null;
}

export interface GetSpaceMembers_spaceGet_members_user {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  randomColor: string;
  name: string;
  avatar: GetSpaceMembers_spaceGet_members_user_avatar | null;
}

export interface GetSpaceMembers_spaceGet_members {
  userId: number;
  spaceId: number;
  createdAt: number;
  role: Role;
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
// GraphQL query operation: GetSpaceInviteTokens
// ====================================================

export interface GetSpaceInviteTokens_spaceGetInviteTokens_creator_avatar {
  publicUrl: string | null;
}

export interface GetSpaceInviteTokens_spaceGetInviteTokens_creator {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: GetSpaceInviteTokens_spaceGetInviteTokens_creator_avatar | null;
  randomColor: string;
}

export interface GetSpaceInviteTokens_spaceGetInviteTokens {
  spaceId: number;
  creator: GetSpaceInviteTokens_spaceGetInviteTokens_creator;
  token: string;
  invitingRole: Role;
  uses: number;
  expireAt: number | null;
  createdAt: number;
}

export interface GetSpaceInviteTokens {
  spaceGetInviteTokens: GetSpaceInviteTokens_spaceGetInviteTokens[];
}

export interface GetSpaceInviteTokensVariables {
  spaceId: number;
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

export interface GetHighlightDocument_documentGet_highlights_thread_creator {
  id: number;
  avatar: GetHighlightDocument_documentGet_highlights_thread_creator_avatar | null;
  firstName: string;
  lastName: string;
  name: string;
  randomColor: string;
}

export interface GetHighlightDocument_documentGet_highlights_thread_comments_sender_avatar {
  publicUrl: string | null;
}

export interface GetHighlightDocument_documentGet_highlights_thread_comments_sender {
  id: number;
  avatar: GetHighlightDocument_documentGet_highlights_thread_comments_sender_avatar | null;
  firstName: string;
  lastName: string;
  name: string;
  randomColor: string;
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
// GraphQL query operation: CheckToken
// ====================================================

export interface CheckToken_userMe {
  id: number;
}

export interface CheckToken {
  userMe: CheckToken_userMe;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CheckDocument
// ====================================================

export interface CheckDocument {
  userCheckDocument: number | null;
}

export interface CheckDocumentVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MyLastActivity
// ====================================================

export interface MyLastActivity_userLastActivity {
  lastDocumentId: any | null;
}

export interface MyLastActivity {
  userLastActivity: MyLastActivity_userLastActivity;
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

export interface UserMe_userMe_activeUserAuth {
  role: Role;
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
// GraphQL query operation: GetDocumentPermissions
// ====================================================

export interface GetDocumentPermissions {
  documentMyPermissions: DocumentActionPermission[];
}

export interface GetDocumentPermissionsVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSpacePermissions
// ====================================================

export interface GetSpacePermissions {
  spaceMyPermissions: SpaceActionPermission[];
}

export interface GetSpacePermissionsVariables {
  spaceId: number;
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

export enum DocumentActionPermission {
  EDIT_DOCUMENT = "EDIT_DOCUMENT",
  INTERACTIVE_WITH_TOOL = "INTERACTIVE_WITH_TOOL",
  MANAGE_DOCUMENT = "MANAGE_DOCUMENT",
  VIEW_ANSWER = "VIEW_ANSWER",
  VIEW_DOCUMENT = "VIEW_DOCUMENT",
}

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

export enum HighlightType {
  NORMAL = "NORMAL",
  REPLACE = "REPLACE",
}

export enum IconType {
  EMOJI = "EMOJI",
  IMAGE = "IMAGE",
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

export enum Role {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
}

export enum RubricType {
  POINT_BASED = "POINT_BASED",
  POINT_RANGE = "POINT_RANGE",
}

export enum SpaceActionPermission {
  MANAGE_SPACE_CONTENT = "MANAGE_SPACE_CONTENT",
  MANAGE_SPACE_MEMBER = "MANAGE_SPACE_MEMBER",
  MANAGE_SPACE_SETTING = "MANAGE_SPACE_SETTING",
  VIEW_SPACE_CONTENT = "VIEW_SPACE_CONTENT",
}

export enum SubmissionEventType {
  SUBMIT_COMPLETED = "SUBMIT_COMPLETED",
}

export enum ThreadCommentType {
  FILE = "FILE",
  TEXT = "TEXT",
}

export interface CreateFileData {
  fileName: string;
  contentType: string;
  contentLength: number;
  public: boolean;
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

export interface NewDocumentAssignedUserInput {
  documentId: any;
  assignedUserId: number;
}

export interface NewDocumentHighlight {
  documentId: any;
  fromPos: number;
  toPos: number;
  uuid: any;
  highlightType: HighlightType;
  originalText: string;
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

export interface SpaceInviteTokenInput {
  spaceId: number;
  invitingRole: Role;
  expireAt?: number | null;
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
  iconType?: IconType | null;
  iconValue?: string | null;
}

export interface UpdatePositionData {
  id: any;
  parentId?: any | null;
  index: number;
}

export interface UpdateSpaceData {
  name: string;
  bannerId?: any | null;
}

export interface UpdateUserData {
  firstName: string;
  lastName: string;
  avatarFileId?: any | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
