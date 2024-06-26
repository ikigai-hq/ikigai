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
// GraphQL mutation operation: SoftDeleteDocument
// ====================================================

export interface SoftDeleteDocument {
  documentSoftDelete: boolean;
}

export interface SoftDeleteDocumentVariables {
  documentId: any;
  includeChildren: boolean;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddDocumentStandalone
// ====================================================

export interface AddDocumentStandalone_documentCreate_assignment {
  id: number;
}

export interface AddDocumentStandalone_documentCreate_submission {
  id: number;
}

export interface AddDocumentStandalone_documentCreate {
  id: any;
  title: string;
  createdAt: number;
  parentId: any | null;
  index: number;
  documentType: DocumentType;
  deletedAt: number | null;
  iconType: IconType | null;
  iconValue: string | null;
  assignment: AddDocumentStandalone_documentCreate_assignment | null;
  submission: AddDocumentStandalone_documentCreate_submission | null;
  isPrivate: boolean;
  isDefaultFolderPrivate: boolean;
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
// GraphQL mutation operation: AddOrUpdatePage
// ====================================================

export interface AddOrUpdatePage_documentAddOrUpdatePage_pageContents {
  id: any;
  pageId: any;
  index: number;
  body: any;
  updatedAt: number;
  createdAt: number;
}

export interface AddOrUpdatePage_documentAddOrUpdatePage {
  id: any;
  documentId: any;
  index: number;
  title: string;
  layout: PageLayout;
  pageContents: AddOrUpdatePage_documentAddOrUpdatePage_pageContents[];
}

export interface AddOrUpdatePage {
  documentAddOrUpdatePage: AddOrUpdatePage_documentAddOrUpdatePage;
}

export interface AddOrUpdatePageVariables {
  page: PageInput;
  isSinglePage?: boolean | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemovePage
// ====================================================

export interface RemovePage {
  documentRemovePage: boolean;
}

export interface RemovePageVariables {
  pageId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddOrUpdatePageContent
// ====================================================

export interface AddOrUpdatePageContent_documentAddOrUpdatePageContent {
  id: any;
  pageId: any;
  index: number;
  body: any;
  updatedAt: number;
  createdAt: number;
}

export interface AddOrUpdatePageContent {
  documentAddOrUpdatePageContent: AddOrUpdatePageContent_documentAddOrUpdatePageContent;
}

export interface AddOrUpdatePageContentVariables {
  pageContent: PageContentInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AssignDocument
// ====================================================

export interface AssignDocument {
  documentAssign: boolean;
}

export interface AssignDocumentVariables {
  documentId: any;
  emails: string[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveDocumentAssignee
// ====================================================

export interface RemoveDocumentAssignee {
  documentRemoveAssignee: boolean;
}

export interface RemoveDocumentAssigneeVariables {
  documentId: any;
  userId: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpsertWritingBlock
// ====================================================

export interface UpsertWritingBlock_documentUpsertWritingBlock {
  id: any;
  pageContentId: any;
  creatorId: number;
  content: any;
  updatedAt: number;
  createdAt: number;
}

export interface UpsertWritingBlock {
  documentUpsertWritingBlock: UpsertWritingBlock_documentUpsertWritingBlock;
}

export interface UpsertWritingBlockVariables {
  pageContentId: any;
  writingBlock: WritingBlockInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CloneWritingBlock
// ====================================================

export interface CloneWritingBlock_documentCloneWritingBlock {
  id: any;
  pageContentId: any;
  creatorId: number;
  content: any;
  updatedAt: number;
  createdAt: number;
}

export interface CloneWritingBlock {
  documentCloneWritingBlock: CloneWritingBlock_documentCloneWritingBlock;
}

export interface CloneWritingBlockVariables {
  writingBlockId: any;
  newWritingBlockId: any;
  newPageContentId: any;
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
// GraphQL mutation operation: FileCheck
// ====================================================

export interface FileCheck {
  fileCheck: string | null;
}

export interface FileCheckVariables {
  fileId: any;
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

export interface DuplicateSpaceDocument_spaceDuplicateDocument_assignment {
  id: number;
}

export interface DuplicateSpaceDocument_spaceDuplicateDocument_submission {
  id: number;
}

export interface DuplicateSpaceDocument_spaceDuplicateDocument {
  id: any;
  title: string;
  createdAt: number;
  parentId: any | null;
  index: number;
  documentType: DocumentType;
  deletedAt: number | null;
  iconType: IconType | null;
  iconValue: string | null;
  assignment: DuplicateSpaceDocument_spaceDuplicateDocument_assignment | null;
  submission: DuplicateSpaceDocument_spaceDuplicateDocument_submission | null;
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

export interface JoinSpaceByInviteToken_spaceJoinByInviteToken {
  documentId: any;
  shouldGoToSpace: boolean;
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
// GraphQL mutation operation: RemoveSpaceMember
// ====================================================

export interface RemoveSpaceMember {
  spaceRemoveMember: boolean;
}

export interface RemoveSpaceMemberVariables {
  spaceId: number;
  userId: number;
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
// GraphQL mutation operation: SigninWithGoogle
// ====================================================

export interface SigninWithGoogle_userSigninWithGoogle_user {
  id: number;
}

export interface SigninWithGoogle_userSigninWithGoogle {
  user: SigninWithGoogle_userSigninWithGoogle_user;
  accessToken: string;
}

export interface SigninWithGoogle {
  userSigninWithGoogle: SigninWithGoogle_userSigninWithGoogle;
}

export interface SigninWithGoogleVariables {
  idToken: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSubmissionsOfAssignment
// ====================================================

export interface GetSubmissionsOfAssignment_assignmentGetSubmissions_user_avatar {
  publicUrl: string | null;
}

export interface GetSubmissionsOfAssignment_assignmentGetSubmissions_user {
  id: number;
  firstName: string;
  lastName: string;
  avatar: GetSubmissionsOfAssignment_assignmentGetSubmissions_user_avatar | null;
  randomColor: string;
}

export interface GetSubmissionsOfAssignment_assignmentGetSubmissions {
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
  attemptNumber: number;
  user: GetSubmissionsOfAssignment_assignmentGetSubmissions_user;
}

export interface GetSubmissionsOfAssignment {
  assignmentGetSubmissions: GetSubmissionsOfAssignment_assignmentGetSubmissions[];
}

export interface GetSubmissionsOfAssignmentVariables {
  assignmentId: number;
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
// GraphQL query operation: GetAssignmentRubric
// ====================================================

export interface GetAssignmentRubric_documentGet_assignment_rubric_data_items_userPick {
  selected: boolean;
  score: number;
  comment: string;
}

export interface GetAssignmentRubric_documentGet_assignment_rubric_data_items {
  explanation: string;
  score: number;
  toScore: number;
  userPick: GetAssignmentRubric_documentGet_assignment_rubric_data_items_userPick;
}

export interface GetAssignmentRubric_documentGet_assignment_rubric_data {
  rubricType: RubricType;
  criteria: string[];
  weightingCriteria: (number | null)[];
  level: string[];
  items: GetAssignmentRubric_documentGet_assignment_rubric_data_items[][];
}

export interface GetAssignmentRubric_documentGet_assignment_rubric {
  id: any;
  name: string;
  data: GetAssignmentRubric_documentGet_assignment_rubric_data;
  createdAt: number;
}

export interface GetAssignmentRubric_documentGet_assignment {
  id: number;
  rubric: GetAssignmentRubric_documentGet_assignment_rubric | null;
}

export interface GetAssignmentRubric_documentGet {
  id: any;
  assignment: GetAssignmentRubric_documentGet_assignment | null;
}

export interface GetAssignmentRubric {
  documentGet: GetAssignmentRubric_documentGet;
}

export interface GetAssignmentRubricVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDocument
// ====================================================

export interface GetDocument_documentGet_assignment {
  id: number;
  maxNumberOfAttempt: number | null;
  preDescription: string | null;
  testDuration: number | null;
  bandScoreId: number | null;
  gradeMethod: GradeMethod;
  gradeByRubricId: any | null;
}

export interface GetDocument_documentGet_submission_user_avatar {
  publicUrl: string | null;
}

export interface GetDocument_documentGet_submission_user {
  id: number;
  name: string;
  avatar: GetDocument_documentGet_submission_user_avatar | null;
  randomColor: string;
}

export interface GetDocument_documentGet_submission_assignment {
  id: number;
  documentId: any;
}

export interface GetDocument_documentGet_submission {
  id: number;
  documentId: any;
  startAt: number;
  submitAt: number | null;
  feedbackAt: number | null;
  feedback: string | null;
  finalGrade: number | null;
  testDuration: number | null;
  attemptNumber: number;
  user: GetDocument_documentGet_submission_user;
  assignment: GetDocument_documentGet_submission_assignment;
}

export interface GetDocument_documentGet {
  id: any;
  title: string;
  coverPhotoId: any | null;
  coverPhotoUrl: string | null;
  updatedAt: number;
  deletedAt: number | null;
  spaceId: number | null;
  iconType: IconType | null;
  iconValue: string | null;
  documentType: DocumentType;
  parentId: any | null;
  isPrivate: boolean;
  isDefaultFolderPrivate: boolean;
  assignment: GetDocument_documentGet_assignment | null;
  submission: GetDocument_documentGet_submission | null;
}

export interface GetDocument {
  documentGet: GetDocument_documentGet;
}

export interface GetDocumentVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPages
// ====================================================

export interface GetPages_documentGet_pages {
  id: any;
  documentId: any;
  index: number;
  title: string;
  layout: PageLayout;
}

export interface GetPages_documentGet {
  id: any;
  pages: GetPages_documentGet_pages[];
}

export interface GetPages {
  documentGet: GetPages_documentGet;
}

export interface GetPagesVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDocumentPageContents
// ====================================================

export interface GetDocumentPageContents_documentGet_pages_pageContents {
  id: any;
  pageId: any;
  index: number;
  body: any;
  updatedAt: number;
  createdAt: number;
}

export interface GetDocumentPageContents_documentGet_pages {
  id: any;
  pageContents: GetDocumentPageContents_documentGet_pages_pageContents[];
}

export interface GetDocumentPageContents_documentGet {
  id: any;
  pages: GetDocumentPageContents_documentGet_pages[];
}

export interface GetDocumentPageContents {
  documentGet: GetDocumentPageContents_documentGet;
}

export interface GetDocumentPageContentsVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDocumentAssignees
// ====================================================

export interface GetDocumentAssignees_documentGetAssignees_user_avatar {
  publicUrl: string | null;
}

export interface GetDocumentAssignees_documentGetAssignees_user {
  id: number;
  name: string;
  avatar: GetDocumentAssignees_documentGetAssignees_user_avatar | null;
}

export interface GetDocumentAssignees_documentGetAssignees {
  createdAt: number;
  user: GetDocumentAssignees_documentGetAssignees_user;
}

export interface GetDocumentAssignees {
  documentGetAssignees: GetDocumentAssignees_documentGetAssignees[];
}

export interface GetDocumentAssigneesVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetWritingBlock
// ====================================================

export interface GetWritingBlock_documentGetWritingBlock {
  id: any;
  pageContentId: any;
  creatorId: number;
  content: any;
  updatedAt: number;
  createdAt: number;
}

export interface GetWritingBlock {
  documentGetWritingBlock: GetWritingBlock_documentGetWritingBlock;
}

export interface GetWritingBlockVariables {
  writingBlockId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetFile
// ====================================================

export interface GetFile_getFile {
  uuid: any;
  contentType: string;
  contentLength: number;
  fileName: string;
}

export interface GetFile {
  getFile: GetFile_getFile;
}

export interface GetFileVariables {
  fileId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDownloadUrl
// ====================================================

export interface GetDownloadUrl_getFile {
  uuid: any;
  downloadUrlByPageContentId: string | null;
}

export interface GetDownloadUrl {
  getFile: GetDownloadUrl_getFile;
}

export interface GetDownloadUrlVariables {
  fileId: any;
  pageContentId: any;
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
  isPrivate: boolean;
  isDefaultFolderPrivate: boolean;
}

export interface GetDocuments_spaceGet {
  id: number;
  name: string;
  creatorId: number;
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
// GraphQL query operation: GetMySpaces
// ====================================================

export interface GetMySpaces_spaceMine_starterDocument {
  id: any;
}

export interface GetMySpaces_spaceMine {
  id: number;
  name: string;
  starterDocument: GetMySpaces_spaceMine_starterDocument;
}

export interface GetMySpaces {
  spaceMine: GetMySpaces_spaceMine[];
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
  VIEW_PAGE_CONTENT = "VIEW_PAGE_CONTENT",
}

export enum DocumentType {
  ASSIGNMENT = "ASSIGNMENT",
  FOLDER = "FOLDER",
  SUBMISSION = "SUBMISSION",
}

export enum GradeMethod {
  AUTO = "AUTO",
  MANUAL = "MANUAL",
  RUBRIC = "RUBRIC",
}

export enum IconType {
  EMOJI = "EMOJI",
  IMAGE = "IMAGE",
}

export enum PageLayout {
  HORIZONTAL = "HORIZONTAL",
  VERTICAL = "VERTICAL",
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

export interface CreateFileData {
  fileName: string;
  contentType: string;
  contentLength: number;
  public: boolean;
}

export interface GradeSubmissionData {
  finalGrade?: number | null;
  feedback?: string | null;
}

export interface NewDocument {
  parentId?: any | null;
  coverPhotoId?: any | null;
  index: number;
  title: string;
  spaceId?: number | null;
  iconType?: IconType | null;
  iconValue?: string | null;
  isPrivate: boolean;
}

export interface NewSpace {
  name: string;
}

export interface PageContentInput {
  id: any;
  pageId: any;
  index: number;
  body: any;
}

export interface PageInput {
  id: any;
  documentId: any;
  index: number;
  title: string;
  layout: PageLayout;
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
  maxNumberOfAttempt?: number | null;
  preDescription?: string | null;
  testDuration?: number | null;
  bandScoreId?: number | null;
  gradeMethod: GradeMethod;
  gradeByRubricId?: any | null;
}

export interface UpdateDocumentData {
  title: string;
  coverPhotoId?: any | null;
  iconType?: IconType | null;
  iconValue?: string | null;
}

export interface UpdatePositionData {
  id: any;
  parentId?: any | null;
  index: number;
  isPrivate: boolean;
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

export interface WritingBlockInput {
  id: any;
  content: any;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
