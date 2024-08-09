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

export interface AddDocumentStandalone_documentCreate_tags {
  tag: string;
}

export interface AddDocumentStandalone_documentCreate_assignment_submissions {
  id: number;
  userId: number;
  finalGrade: number | null;
  grade: number | null;
  attemptNumber: number;
  documentId: any;
}

export interface AddDocumentStandalone_documentCreate_assignment {
  id: number;
  submissions: AddDocumentStandalone_documentCreate_assignment_submissions[];
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
  tags: AddDocumentStandalone_documentCreate_tags[];
  assignment: AddDocumentStandalone_documentCreate_assignment | null;
  submission: AddDocumentStandalone_documentCreate_submission | null;
  visibility: DocumentVisibility;
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
// GraphQL mutation operation: GenerateQuizzes
// ====================================================

export interface GenerateQuizzes_quizGenerateByAi_singleChoiceData_quizzes {
  question: string;
  answers: string[];
  correctAnswer: string;
}

export interface GenerateQuizzes_quizGenerateByAi_singleChoiceData {
  subject: string;
  quizzes: GenerateQuizzes_quizGenerateByAi_singleChoiceData_quizzes[];
}

export interface GenerateQuizzes_quizGenerateByAi_multipleChoiceData_quizzes {
  question: string;
  answers: string[];
  correctAnswers: string[];
}

export interface GenerateQuizzes_quizGenerateByAi_multipleChoiceData {
  subject: string;
  quizzes: GenerateQuizzes_quizGenerateByAi_multipleChoiceData_quizzes[];
}

export interface GenerateQuizzes_quizGenerateByAi_fillInBlankData_quizzes {
  position: number;
  correctAnswer: string;
}

export interface GenerateQuizzes_quizGenerateByAi_fillInBlankData {
  content: string;
  quizzes: GenerateQuizzes_quizGenerateByAi_fillInBlankData_quizzes[];
}

export interface GenerateQuizzes_quizGenerateByAi {
  quizType: QuizType;
  singleChoiceData: GenerateQuizzes_quizGenerateByAi_singleChoiceData | null;
  multipleChoiceData: GenerateQuizzes_quizGenerateByAi_multipleChoiceData | null;
  fillInBlankData: GenerateQuizzes_quizGenerateByAi_fillInBlankData | null;
}

export interface GenerateQuizzes {
  quizGenerateByAi: GenerateQuizzes_quizGenerateByAi;
}

export interface GenerateQuizzesVariables {
  quizType: QuizType;
  data: GenerateQuizzesRequestData;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddDocumentTag
// ====================================================

export interface AddDocumentTag_documentAddTag {
  tag: string;
}

export interface AddDocumentTag {
  documentAddTag: AddDocumentTag_documentAddTag;
}

export interface AddDocumentTagVariables {
  tag: DocumentTagInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveDocumentTag
// ====================================================

export interface RemoveDocumentTag {
  documentRemoveTag: boolean;
}

export interface RemoveDocumentTagVariables {
  tag: DocumentTagInput;
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
// GraphQL mutation operation: UpsertQuiz
// ====================================================

export interface UpsertQuiz_quizUpsert_writingQuestion {
  content: any;
}

export interface UpsertQuiz_quizUpsert_singleChoiceQuestion_options {
  id: any;
  content: string;
}

export interface UpsertQuiz_quizUpsert_singleChoiceQuestion {
  question: string;
  options: UpsertQuiz_quizUpsert_singleChoiceQuestion_options[];
}

export interface UpsertQuiz_quizUpsert_singleChoiceExpectedAnswer {
  expectedChoices: any[];
}

export interface UpsertQuiz_quizUpsert_multipleChoiceQuestion_options {
  id: any;
  content: string;
}

export interface UpsertQuiz_quizUpsert_multipleChoiceQuestion {
  question: string;
  options: UpsertQuiz_quizUpsert_multipleChoiceQuestion_options[];
}

export interface UpsertQuiz_quizUpsert_multipleChoiceExpectedAnswer {
  expectedChoices: any[];
}

export interface UpsertQuiz_quizUpsert_selectOptionQuestion_options {
  id: any;
  content: string;
}

export interface UpsertQuiz_quizUpsert_selectOptionQuestion {
  options: UpsertQuiz_quizUpsert_selectOptionQuestion_options[];
}

export interface UpsertQuiz_quizUpsert_selectOptionExpectedAnswer {
  expectedChoices: any[];
}

export interface UpsertQuiz_quizUpsert_fillInBlankQuestion {
  content: string | null;
}

export interface UpsertQuiz_quizUpsert_fillInBlankExpectedAnswer_expectedAnswers {
  id: any;
  content: string;
}

export interface UpsertQuiz_quizUpsert_fillInBlankExpectedAnswer {
  expectedAnswers: UpsertQuiz_quizUpsert_fillInBlankExpectedAnswer_expectedAnswers[];
}

export interface UpsertQuiz_quizUpsert_myAnswer_singleChoiceAnswer {
  choices: any[];
}

export interface UpsertQuiz_quizUpsert_myAnswer_multipleChoiceAnswer {
  choices: any[];
}

export interface UpsertQuiz_quizUpsert_myAnswer_selectOptionAnswer {
  choice: any;
}

export interface UpsertQuiz_quizUpsert_myAnswer_fillInBlankAnswer {
  answer: string;
}

export interface UpsertQuiz_quizUpsert_myAnswer {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: UpsertQuiz_quizUpsert_myAnswer_singleChoiceAnswer | null;
  multipleChoiceAnswer: UpsertQuiz_quizUpsert_myAnswer_multipleChoiceAnswer | null;
  selectOptionAnswer: UpsertQuiz_quizUpsert_myAnswer_selectOptionAnswer | null;
  fillInBlankAnswer: UpsertQuiz_quizUpsert_myAnswer_fillInBlankAnswer | null;
}

export interface UpsertQuiz_quizUpsert_answers_singleChoiceAnswer {
  choices: any[];
}

export interface UpsertQuiz_quizUpsert_answers_multipleChoiceAnswer {
  choices: any[];
}

export interface UpsertQuiz_quizUpsert_answers_selectOptionAnswer {
  choice: any;
}

export interface UpsertQuiz_quizUpsert_answers_fillInBlankAnswer {
  answer: string;
}

export interface UpsertQuiz_quizUpsert_answers {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: UpsertQuiz_quizUpsert_answers_singleChoiceAnswer | null;
  multipleChoiceAnswer: UpsertQuiz_quizUpsert_answers_multipleChoiceAnswer | null;
  selectOptionAnswer: UpsertQuiz_quizUpsert_answers_selectOptionAnswer | null;
  fillInBlankAnswer: UpsertQuiz_quizUpsert_answers_fillInBlankAnswer | null;
}

export interface UpsertQuiz_quizUpsert {
  id: any;
  pageContentId: any;
  creatorId: number;
  quizType: QuizType;
  questionData: any | null;
  answerData: any | null;
  writingQuestion: UpsertQuiz_quizUpsert_writingQuestion | null;
  singleChoiceQuestion: UpsertQuiz_quizUpsert_singleChoiceQuestion | null;
  singleChoiceExpectedAnswer: UpsertQuiz_quizUpsert_singleChoiceExpectedAnswer | null;
  multipleChoiceQuestion: UpsertQuiz_quizUpsert_multipleChoiceQuestion | null;
  multipleChoiceExpectedAnswer: UpsertQuiz_quizUpsert_multipleChoiceExpectedAnswer | null;
  selectOptionQuestion: UpsertQuiz_quizUpsert_selectOptionQuestion | null;
  selectOptionExpectedAnswer: UpsertQuiz_quizUpsert_selectOptionExpectedAnswer | null;
  fillInBlankQuestion: UpsertQuiz_quizUpsert_fillInBlankQuestion | null;
  fillInBlankExpectedAnswer: UpsertQuiz_quizUpsert_fillInBlankExpectedAnswer | null;
  myAnswer: UpsertQuiz_quizUpsert_myAnswer | null;
  answers: UpsertQuiz_quizUpsert_answers[];
}

export interface UpsertQuiz {
  quizUpsert: UpsertQuiz_quizUpsert;
}

export interface UpsertQuizVariables {
  pageContentId: any;
  data: QuizInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CloneQuiz
// ====================================================

export interface CloneQuiz_quizClone_writingQuestion {
  content: any;
}

export interface CloneQuiz_quizClone_singleChoiceQuestion_options {
  id: any;
  content: string;
}

export interface CloneQuiz_quizClone_singleChoiceQuestion {
  question: string;
  options: CloneQuiz_quizClone_singleChoiceQuestion_options[];
}

export interface CloneQuiz_quizClone_singleChoiceExpectedAnswer {
  expectedChoices: any[];
}

export interface CloneQuiz_quizClone_multipleChoiceQuestion_options {
  id: any;
  content: string;
}

export interface CloneQuiz_quizClone_multipleChoiceQuestion {
  question: string;
  options: CloneQuiz_quizClone_multipleChoiceQuestion_options[];
}

export interface CloneQuiz_quizClone_multipleChoiceExpectedAnswer {
  expectedChoices: any[];
}

export interface CloneQuiz_quizClone_selectOptionQuestion_options {
  id: any;
  content: string;
}

export interface CloneQuiz_quizClone_selectOptionQuestion {
  options: CloneQuiz_quizClone_selectOptionQuestion_options[];
}

export interface CloneQuiz_quizClone_selectOptionExpectedAnswer {
  expectedChoices: any[];
}

export interface CloneQuiz_quizClone_fillInBlankQuestion {
  content: string | null;
}

export interface CloneQuiz_quizClone_fillInBlankExpectedAnswer_expectedAnswers {
  id: any;
  content: string;
}

export interface CloneQuiz_quizClone_fillInBlankExpectedAnswer {
  expectedAnswers: CloneQuiz_quizClone_fillInBlankExpectedAnswer_expectedAnswers[];
}

export interface CloneQuiz_quizClone_myAnswer_singleChoiceAnswer {
  choices: any[];
}

export interface CloneQuiz_quizClone_myAnswer_multipleChoiceAnswer {
  choices: any[];
}

export interface CloneQuiz_quizClone_myAnswer_selectOptionAnswer {
  choice: any;
}

export interface CloneQuiz_quizClone_myAnswer_fillInBlankAnswer {
  answer: string;
}

export interface CloneQuiz_quizClone_myAnswer {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: CloneQuiz_quizClone_myAnswer_singleChoiceAnswer | null;
  multipleChoiceAnswer: CloneQuiz_quizClone_myAnswer_multipleChoiceAnswer | null;
  selectOptionAnswer: CloneQuiz_quizClone_myAnswer_selectOptionAnswer | null;
  fillInBlankAnswer: CloneQuiz_quizClone_myAnswer_fillInBlankAnswer | null;
}

export interface CloneQuiz_quizClone_answers_singleChoiceAnswer {
  choices: any[];
}

export interface CloneQuiz_quizClone_answers_multipleChoiceAnswer {
  choices: any[];
}

export interface CloneQuiz_quizClone_answers_selectOptionAnswer {
  choice: any;
}

export interface CloneQuiz_quizClone_answers_fillInBlankAnswer {
  answer: string;
}

export interface CloneQuiz_quizClone_answers {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: CloneQuiz_quizClone_answers_singleChoiceAnswer | null;
  multipleChoiceAnswer: CloneQuiz_quizClone_answers_multipleChoiceAnswer | null;
  selectOptionAnswer: CloneQuiz_quizClone_answers_selectOptionAnswer | null;
  fillInBlankAnswer: CloneQuiz_quizClone_answers_fillInBlankAnswer | null;
}

export interface CloneQuiz_quizClone {
  id: any;
  pageContentId: any;
  creatorId: number;
  quizType: QuizType;
  questionData: any | null;
  answerData: any | null;
  writingQuestion: CloneQuiz_quizClone_writingQuestion | null;
  singleChoiceQuestion: CloneQuiz_quizClone_singleChoiceQuestion | null;
  singleChoiceExpectedAnswer: CloneQuiz_quizClone_singleChoiceExpectedAnswer | null;
  multipleChoiceQuestion: CloneQuiz_quizClone_multipleChoiceQuestion | null;
  multipleChoiceExpectedAnswer: CloneQuiz_quizClone_multipleChoiceExpectedAnswer | null;
  selectOptionQuestion: CloneQuiz_quizClone_selectOptionQuestion | null;
  selectOptionExpectedAnswer: CloneQuiz_quizClone_selectOptionExpectedAnswer | null;
  fillInBlankQuestion: CloneQuiz_quizClone_fillInBlankQuestion | null;
  fillInBlankExpectedAnswer: CloneQuiz_quizClone_fillInBlankExpectedAnswer | null;
  myAnswer: CloneQuiz_quizClone_myAnswer | null;
  answers: CloneQuiz_quizClone_answers[];
}

export interface CloneQuiz {
  quizClone: CloneQuiz_quizClone;
}

export interface CloneQuizVariables {
  quizId: any;
  newQuizId: any;
  newPageContentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AnswerQuiz
// ====================================================

export interface AnswerQuiz_quizAnswer_singleChoiceAnswer {
  choices: any[];
}

export interface AnswerQuiz_quizAnswer_multipleChoiceAnswer {
  choices: any[];
}

export interface AnswerQuiz_quizAnswer_selectOptionAnswer {
  choice: any;
}

export interface AnswerQuiz_quizAnswer_fillInBlankAnswer {
  answer: string;
}

export interface AnswerQuiz_quizAnswer {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: AnswerQuiz_quizAnswer_singleChoiceAnswer | null;
  multipleChoiceAnswer: AnswerQuiz_quizAnswer_multipleChoiceAnswer | null;
  selectOptionAnswer: AnswerQuiz_quizAnswer_selectOptionAnswer | null;
  fillInBlankAnswer: AnswerQuiz_quizAnswer_fillInBlankAnswer | null;
}

export interface AnswerQuiz {
  quizAnswer: AnswerQuiz_quizAnswer;
}

export interface AnswerQuizVariables {
  data: QuizUserAnswerInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ConvertAIQuiz
// ====================================================

export interface ConvertAIQuiz_quizConvertAiQuiz_writingQuestion {
  content: any;
}

export interface ConvertAIQuiz_quizConvertAiQuiz_singleChoiceQuestion_options {
  id: any;
  content: string;
}

export interface ConvertAIQuiz_quizConvertAiQuiz_singleChoiceQuestion {
  question: string;
  options: ConvertAIQuiz_quizConvertAiQuiz_singleChoiceQuestion_options[];
}

export interface ConvertAIQuiz_quizConvertAiQuiz_singleChoiceExpectedAnswer {
  expectedChoices: any[];
}

export interface ConvertAIQuiz_quizConvertAiQuiz_multipleChoiceQuestion_options {
  id: any;
  content: string;
}

export interface ConvertAIQuiz_quizConvertAiQuiz_multipleChoiceQuestion {
  question: string;
  options: ConvertAIQuiz_quizConvertAiQuiz_multipleChoiceQuestion_options[];
}

export interface ConvertAIQuiz_quizConvertAiQuiz_multipleChoiceExpectedAnswer {
  expectedChoices: any[];
}

export interface ConvertAIQuiz_quizConvertAiQuiz_selectOptionQuestion_options {
  id: any;
  content: string;
}

export interface ConvertAIQuiz_quizConvertAiQuiz_selectOptionQuestion {
  options: ConvertAIQuiz_quizConvertAiQuiz_selectOptionQuestion_options[];
}

export interface ConvertAIQuiz_quizConvertAiQuiz_selectOptionExpectedAnswer {
  expectedChoices: any[];
}

export interface ConvertAIQuiz_quizConvertAiQuiz_fillInBlankQuestion {
  content: string | null;
}

export interface ConvertAIQuiz_quizConvertAiQuiz_fillInBlankExpectedAnswer_expectedAnswers {
  id: any;
  content: string;
}

export interface ConvertAIQuiz_quizConvertAiQuiz_fillInBlankExpectedAnswer {
  expectedAnswers: ConvertAIQuiz_quizConvertAiQuiz_fillInBlankExpectedAnswer_expectedAnswers[];
}

export interface ConvertAIQuiz_quizConvertAiQuiz_myAnswer_singleChoiceAnswer {
  choices: any[];
}

export interface ConvertAIQuiz_quizConvertAiQuiz_myAnswer_multipleChoiceAnswer {
  choices: any[];
}

export interface ConvertAIQuiz_quizConvertAiQuiz_myAnswer_selectOptionAnswer {
  choice: any;
}

export interface ConvertAIQuiz_quizConvertAiQuiz_myAnswer_fillInBlankAnswer {
  answer: string;
}

export interface ConvertAIQuiz_quizConvertAiQuiz_myAnswer {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: ConvertAIQuiz_quizConvertAiQuiz_myAnswer_singleChoiceAnswer | null;
  multipleChoiceAnswer: ConvertAIQuiz_quizConvertAiQuiz_myAnswer_multipleChoiceAnswer | null;
  selectOptionAnswer: ConvertAIQuiz_quizConvertAiQuiz_myAnswer_selectOptionAnswer | null;
  fillInBlankAnswer: ConvertAIQuiz_quizConvertAiQuiz_myAnswer_fillInBlankAnswer | null;
}

export interface ConvertAIQuiz_quizConvertAiQuiz_answers_singleChoiceAnswer {
  choices: any[];
}

export interface ConvertAIQuiz_quizConvertAiQuiz_answers_multipleChoiceAnswer {
  choices: any[];
}

export interface ConvertAIQuiz_quizConvertAiQuiz_answers_selectOptionAnswer {
  choice: any;
}

export interface ConvertAIQuiz_quizConvertAiQuiz_answers_fillInBlankAnswer {
  answer: string;
}

export interface ConvertAIQuiz_quizConvertAiQuiz_answers {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: ConvertAIQuiz_quizConvertAiQuiz_answers_singleChoiceAnswer | null;
  multipleChoiceAnswer: ConvertAIQuiz_quizConvertAiQuiz_answers_multipleChoiceAnswer | null;
  selectOptionAnswer: ConvertAIQuiz_quizConvertAiQuiz_answers_selectOptionAnswer | null;
  fillInBlankAnswer: ConvertAIQuiz_quizConvertAiQuiz_answers_fillInBlankAnswer | null;
}

export interface ConvertAIQuiz_quizConvertAiQuiz {
  id: any;
  pageContentId: any;
  creatorId: number;
  quizType: QuizType;
  questionData: any | null;
  answerData: any | null;
  writingQuestion: ConvertAIQuiz_quizConvertAiQuiz_writingQuestion | null;
  singleChoiceQuestion: ConvertAIQuiz_quizConvertAiQuiz_singleChoiceQuestion | null;
  singleChoiceExpectedAnswer: ConvertAIQuiz_quizConvertAiQuiz_singleChoiceExpectedAnswer | null;
  multipleChoiceQuestion: ConvertAIQuiz_quizConvertAiQuiz_multipleChoiceQuestion | null;
  multipleChoiceExpectedAnswer: ConvertAIQuiz_quizConvertAiQuiz_multipleChoiceExpectedAnswer | null;
  selectOptionQuestion: ConvertAIQuiz_quizConvertAiQuiz_selectOptionQuestion | null;
  selectOptionExpectedAnswer: ConvertAIQuiz_quizConvertAiQuiz_selectOptionExpectedAnswer | null;
  fillInBlankQuestion: ConvertAIQuiz_quizConvertAiQuiz_fillInBlankQuestion | null;
  fillInBlankExpectedAnswer: ConvertAIQuiz_quizConvertAiQuiz_fillInBlankExpectedAnswer | null;
  myAnswer: ConvertAIQuiz_quizConvertAiQuiz_myAnswer | null;
  answers: ConvertAIQuiz_quizConvertAiQuiz_answers[];
}

export interface ConvertAIQuiz {
  quizConvertAiQuiz: ConvertAIQuiz_quizConvertAiQuiz[];
}

export interface ConvertAIQuizVariables {
  pageContentId: any;
  data: AIGenerateQuizInput;
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

export interface CreateSpace_spaceCreate {
  id: number;
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

export interface GetDocument_documentGet_tags {
  tag: string;
}

export interface GetDocument_documentGet_assignment {
  id: number;
  maxNumberOfAttempt: number | null;
  preDescription: string | null;
  testDuration: number | null;
  bandScoreId: number | null;
  gradeMethod: GradeMethod;
  gradeByRubricId: any | null;
  totalQuiz: number;
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
  visibility: DocumentVisibility;
  tags: GetDocument_documentGet_tags[];
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
// GraphQL query operation: GetDocumentQuizzes
// ====================================================

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_writingQuestion {
  content: any;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceQuestion_options {
  id: any;
  content: string;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceQuestion {
  question: string;
  options: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceQuestion_options[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceExpectedAnswer {
  expectedChoices: any[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_multipleChoiceQuestion_options {
  id: any;
  content: string;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_multipleChoiceQuestion {
  question: string;
  options: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_multipleChoiceQuestion_options[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_multipleChoiceExpectedAnswer {
  expectedChoices: any[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_selectOptionQuestion_options {
  id: any;
  content: string;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_selectOptionQuestion {
  options: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_selectOptionQuestion_options[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_selectOptionExpectedAnswer {
  expectedChoices: any[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_fillInBlankQuestion {
  content: string | null;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_fillInBlankExpectedAnswer_expectedAnswers {
  id: any;
  content: string;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_fillInBlankExpectedAnswer {
  expectedAnswers: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_fillInBlankExpectedAnswer_expectedAnswers[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_singleChoiceAnswer {
  choices: any[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_multipleChoiceAnswer {
  choices: any[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_selectOptionAnswer {
  choice: any;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_fillInBlankAnswer {
  answer: string;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_singleChoiceAnswer | null;
  multipleChoiceAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_multipleChoiceAnswer | null;
  selectOptionAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_selectOptionAnswer | null;
  fillInBlankAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_fillInBlankAnswer | null;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_answers_singleChoiceAnswer {
  choices: any[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_answers_multipleChoiceAnswer {
  choices: any[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_answers_selectOptionAnswer {
  choice: any;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_answers_fillInBlankAnswer {
  answer: string;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_answers {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_answers_singleChoiceAnswer | null;
  multipleChoiceAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_answers_multipleChoiceAnswer | null;
  selectOptionAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_answers_selectOptionAnswer | null;
  fillInBlankAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_answers_fillInBlankAnswer | null;
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents_quizzes {
  id: any;
  pageContentId: any;
  creatorId: number;
  quizType: QuizType;
  questionData: any | null;
  answerData: any | null;
  writingQuestion: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_writingQuestion | null;
  singleChoiceQuestion: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceQuestion | null;
  singleChoiceExpectedAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceExpectedAnswer | null;
  multipleChoiceQuestion: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_multipleChoiceQuestion | null;
  multipleChoiceExpectedAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_multipleChoiceExpectedAnswer | null;
  selectOptionQuestion: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_selectOptionQuestion | null;
  selectOptionExpectedAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_selectOptionExpectedAnswer | null;
  fillInBlankQuestion: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_fillInBlankQuestion | null;
  fillInBlankExpectedAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_fillInBlankExpectedAnswer | null;
  myAnswer: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer | null;
  answers: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_answers[];
}

export interface GetDocumentQuizzes_documentGet_pages_pageContents {
  id: any;
  quizzes: GetDocumentQuizzes_documentGet_pages_pageContents_quizzes[];
}

export interface GetDocumentQuizzes_documentGet_pages {
  id: any;
  pageContents: GetDocumentQuizzes_documentGet_pages_pageContents[];
}

export interface GetDocumentQuizzes_documentGet {
  id: any;
  pages: GetDocumentQuizzes_documentGet_pages[];
}

export interface GetDocumentQuizzes {
  documentGet: GetDocumentQuizzes_documentGet;
}

export interface GetDocumentQuizzesVariables {
  documentId: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDocuments
// ====================================================

export interface GetDocuments_spaceGet_documents_tags {
  tag: string;
}

export interface GetDocuments_spaceGet_documents_assignment_submissions {
  id: number;
  userId: number;
  finalGrade: number | null;
  grade: number | null;
  attemptNumber: number;
  documentId: any;
}

export interface GetDocuments_spaceGet_documents_assignment {
  id: number;
  submissions: GetDocuments_spaceGet_documents_assignment_submissions[];
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
  tags: GetDocuments_spaceGet_documents_tags[];
  assignment: GetDocuments_spaceGet_documents_assignment | null;
  submission: GetDocuments_spaceGet_documents_submission | null;
  visibility: DocumentVisibility;
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

export interface GetMySpaces_spaceMine {
  id: number;
  name: string;
}

export interface GetMySpaces {
  spaceMine: GetMySpaces_spaceMine[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMyOwnSpaces
// ====================================================

export interface GetMyOwnSpaces_spaceOwn {
  id: number;
  name: string;
}

export interface GetMyOwnSpaces {
  spaceOwn: GetMyOwnSpaces_spaceOwn[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSpaceAvailableDocuments
// ====================================================

export interface GetSpaceAvailableDocuments_spaceGet_nonSubmissionDocuments {
  id: any;
}

export interface GetSpaceAvailableDocuments_spaceGet {
  id: number;
  nonSubmissionDocuments: GetSpaceAvailableDocuments_spaceGet_nonSubmissionDocuments[];
}

export interface GetSpaceAvailableDocuments {
  spaceGet: GetSpaceAvailableDocuments_spaceGet;
}

export interface GetSpaceAvailableDocumentsVariables {
  spaceId: number;
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
  spaceGetSpaceByDocument: number | null;
}

export interface CheckDocumentVariables {
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
// GraphQL query operation: GetAIUsage
// ====================================================

export interface GetAIUsage_userMe_aiSessionsOfToday {
  id: any;
  action: Aiaction;
  createdAt: number;
}

export interface GetAIUsage_userMe {
  id: number;
  maxAiUsage: number;
  aiSessionsOfToday: GetAIUsage_userMe_aiSessionsOfToday[];
}

export interface GetAIUsage {
  userMe: GetAIUsage_userMe;
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

// ====================================================
// GraphQL fragment: CoreQuizUserAnswerFields
// ====================================================

export interface CoreQuizUserAnswerFields_singleChoiceAnswer {
  choices: any[];
}

export interface CoreQuizUserAnswerFields_multipleChoiceAnswer {
  choices: any[];
}

export interface CoreQuizUserAnswerFields_selectOptionAnswer {
  choice: any;
}

export interface CoreQuizUserAnswerFields_fillInBlankAnswer {
  answer: string;
}

export interface CoreQuizUserAnswerFields {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: CoreQuizUserAnswerFields_singleChoiceAnswer | null;
  multipleChoiceAnswer: CoreQuizUserAnswerFields_multipleChoiceAnswer | null;
  selectOptionAnswer: CoreQuizUserAnswerFields_selectOptionAnswer | null;
  fillInBlankAnswer: CoreQuizUserAnswerFields_fillInBlankAnswer | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: CoreQuizFields
// ====================================================

export interface CoreQuizFields_writingQuestion {
  content: any;
}

export interface CoreQuizFields_singleChoiceQuestion_options {
  id: any;
  content: string;
}

export interface CoreQuizFields_singleChoiceQuestion {
  question: string;
  options: CoreQuizFields_singleChoiceQuestion_options[];
}

export interface CoreQuizFields_singleChoiceExpectedAnswer {
  expectedChoices: any[];
}

export interface CoreQuizFields_multipleChoiceQuestion_options {
  id: any;
  content: string;
}

export interface CoreQuizFields_multipleChoiceQuestion {
  question: string;
  options: CoreQuizFields_multipleChoiceQuestion_options[];
}

export interface CoreQuizFields_multipleChoiceExpectedAnswer {
  expectedChoices: any[];
}

export interface CoreQuizFields_selectOptionQuestion_options {
  id: any;
  content: string;
}

export interface CoreQuizFields_selectOptionQuestion {
  options: CoreQuizFields_selectOptionQuestion_options[];
}

export interface CoreQuizFields_selectOptionExpectedAnswer {
  expectedChoices: any[];
}

export interface CoreQuizFields_fillInBlankQuestion {
  content: string | null;
}

export interface CoreQuizFields_fillInBlankExpectedAnswer_expectedAnswers {
  id: any;
  content: string;
}

export interface CoreQuizFields_fillInBlankExpectedAnswer {
  expectedAnswers: CoreQuizFields_fillInBlankExpectedAnswer_expectedAnswers[];
}

export interface CoreQuizFields_myAnswer_singleChoiceAnswer {
  choices: any[];
}

export interface CoreQuizFields_myAnswer_multipleChoiceAnswer {
  choices: any[];
}

export interface CoreQuizFields_myAnswer_selectOptionAnswer {
  choice: any;
}

export interface CoreQuizFields_myAnswer_fillInBlankAnswer {
  answer: string;
}

export interface CoreQuizFields_myAnswer {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: CoreQuizFields_myAnswer_singleChoiceAnswer | null;
  multipleChoiceAnswer: CoreQuizFields_myAnswer_multipleChoiceAnswer | null;
  selectOptionAnswer: CoreQuizFields_myAnswer_selectOptionAnswer | null;
  fillInBlankAnswer: CoreQuizFields_myAnswer_fillInBlankAnswer | null;
}

export interface CoreQuizFields_answers_singleChoiceAnswer {
  choices: any[];
}

export interface CoreQuizFields_answers_multipleChoiceAnswer {
  choices: any[];
}

export interface CoreQuizFields_answers_selectOptionAnswer {
  choice: any;
}

export interface CoreQuizFields_answers_fillInBlankAnswer {
  answer: string;
}

export interface CoreQuizFields_answers {
  quizId: any;
  userId: number;
  score: number | null;
  answerData: any;
  singleChoiceAnswer: CoreQuizFields_answers_singleChoiceAnswer | null;
  multipleChoiceAnswer: CoreQuizFields_answers_multipleChoiceAnswer | null;
  selectOptionAnswer: CoreQuizFields_answers_selectOptionAnswer | null;
  fillInBlankAnswer: CoreQuizFields_answers_fillInBlankAnswer | null;
}

export interface CoreQuizFields {
  id: any;
  pageContentId: any;
  creatorId: number;
  quizType: QuizType;
  questionData: any | null;
  answerData: any | null;
  writingQuestion: CoreQuizFields_writingQuestion | null;
  singleChoiceQuestion: CoreQuizFields_singleChoiceQuestion | null;
  singleChoiceExpectedAnswer: CoreQuizFields_singleChoiceExpectedAnswer | null;
  multipleChoiceQuestion: CoreQuizFields_multipleChoiceQuestion | null;
  multipleChoiceExpectedAnswer: CoreQuizFields_multipleChoiceExpectedAnswer | null;
  selectOptionQuestion: CoreQuizFields_selectOptionQuestion | null;
  selectOptionExpectedAnswer: CoreQuizFields_selectOptionExpectedAnswer | null;
  fillInBlankQuestion: CoreQuizFields_fillInBlankQuestion | null;
  fillInBlankExpectedAnswer: CoreQuizFields_fillInBlankExpectedAnswer | null;
  myAnswer: CoreQuizFields_myAnswer | null;
  answers: CoreQuizFields_answers[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum Aiaction {
  GENERATE_QUIZZES = "GENERATE_QUIZZES",
}

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

export enum DocumentVisibility {
  ASSIGNEES = "ASSIGNEES",
  PRIVATE = "PRIVATE",
  PUBLIC = "PUBLIC",
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

export enum QuizType {
  FILL_IN_BLANK = "FILL_IN_BLANK",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  SELECT_OPTION = "SELECT_OPTION",
  SINGLE_CHOICE = "SINGLE_CHOICE",
  WRITING_BLOCK = "WRITING_BLOCK",
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

export interface AIFillInBlankQuizInput {
  correctAnswer: string;
}

export interface AIGenerateQuizInput {
  singleChoiceData: AISingleChoiceQuizInput[];
  multipleChoiceData: AISMultipleChoiceQuizInput[];
  fillInBlankData: AIFillInBlankQuizInput[];
}

export interface AISMultipleChoiceQuizInput {
  question: string;
  answers: string[];
  correctAnswers: string[];
}

export interface AISingleChoiceQuizInput {
  question: string;
  answers: string[];
  correctAnswer: string;
}

export interface CreateFileData {
  fileName: string;
  contentType: string;
  contentLength: number;
  public: boolean;
}

export interface DocumentTagInput {
  documentId: any;
  tag: string;
}

export interface GenerateQuizzesRequestData {
  userContext: string;
  subject: string;
  totalQuizzes: number;
}

export interface GradeSubmissionData {
  finalGrade?: number | null;
  feedback?: string | null;
}

export interface NewDocument {
  parentId?: any | null;
  title: string;
  spaceId?: number | null;
  iconType?: IconType | null;
  iconValue?: string | null;
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

export interface QuizInput {
  id: any;
  quizType: QuizType;
  questionData: any;
  answerData: any;
}

export interface QuizUserAnswerInput {
  quizId: any;
  answerData: any;
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
  visibility: DocumentVisibility;
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
