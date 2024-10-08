import create from "zustand";

import {
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_fillInBlankExpectedAnswer,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_fillInBlankQuestion,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_multipleChoiceExpectedAnswer,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_multipleChoiceQuestion,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_fillInBlankAnswer,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_multipleChoiceAnswer,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_selectOptionAnswer,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_singleChoiceAnswer,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_selectOptionExpectedAnswer,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_selectOptionQuestion,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceExpectedAnswer,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceQuestion,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_writingQuestion,
  GenerateQuizzes_quizGenerateByAi_singleChoiceData_quizzes,
  GenerateQuizzes_quizGenerateByAi_multipleChoiceData_quizzes,
  GenerateQuizzes_quizGenerateByAi_fillInBlankData,
  QuizType,
  GenerateQuizzes_quizGenerateByAi_selectOptionsData,
} from "graphql/types";
import { cloneDeep } from "lodash";

export type IQuiz = GetDocumentQuizzes_documentGet_pages_pageContents_quizzes;
export type IQuizAnswer =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer;

export type IWritingQuestion =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_writingQuestion;

export type ISingleChoiceQuestion =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceQuestion;
export type ISingleChoiceExpectedAnswer =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceExpectedAnswer;
export type ISingleChoiceAnswer =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_singleChoiceAnswer;

export type IMultipleChoiceQuestion =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_multipleChoiceQuestion;
export type IMultipleChoiceExpectedAnswer =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_multipleChoiceExpectedAnswer;
export type IMultipleChoiceAnswer =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_multipleChoiceAnswer;

export type ISelectOptionQuestion =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_selectOptionQuestion;
export type ISelectOptionExpectedAnswer =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_selectOptionExpectedAnswer;
export type ISelectOptionAnswer =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_selectOptionAnswer;

export type IFillInBlankQuestion =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_fillInBlankQuestion;
export type IFillInBlankExpectedAnswer =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_fillInBlankExpectedAnswer;
export type IFillInBlankAnswer =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_fillInBlankAnswer;

export type AISingeChoiceQuiz =
  GenerateQuizzes_quizGenerateByAi_singleChoiceData_quizzes;
export type AIMultipleChoiceQuiz =
  GenerateQuizzes_quizGenerateByAi_multipleChoiceData_quizzes;
export type AIFillInBlankQuiz =
  GenerateQuizzes_quizGenerateByAi_fillInBlankData;
export type AISelectOptionQuiz =
  GenerateQuizzes_quizGenerateByAi_selectOptionsData;

export type AIGeneratedQuiz = (
  | AISingeChoiceQuiz
  | AIMultipleChoiceQuiz
  | AIFillInBlankQuiz
  | AISelectOptionQuiz
) & { quizType: QuizType };

export type QuestionData =
  | IWritingQuestion
  | ISingleChoiceQuestion
  | IMultipleChoiceQuestion
  | ISelectOptionQuestion
  | IFillInBlankQuestion
  | {};
export type QuestionExpectedAnswer =
  | ISingleChoiceExpectedAnswer
  | IMultipleChoiceExpectedAnswer
  | ISelectOptionExpectedAnswer
  | IFillInBlankExpectedAnswer
  | {};
export type QuestionUserAnswer =
  | ISingleChoiceAnswer
  | IMultipleChoiceAnswer
  | ISelectOptionAnswer
  | IFillInBlankAnswer
  | {};

export type IQuizStore = {
  quizzes: IQuiz[];
  setQuizzes: (quizzes: IQuiz[]) => void;
  addOrUpdateQuiz: (quiz: IQuiz) => void;
  removeQuiz: (quizId: string) => void;
};

const useQuizStore = create<IQuizStore>((set, get) => ({
  quizzes: [],
  setQuizzes: (quizzes) => set({ quizzes: cloneDeep(quizzes) }),
  addOrUpdateQuiz: (quiz) => {
    const quizzes = get().quizzes;
    const index = quizzes.findIndex((q) => q.id === quiz.id);
    if (index > -1) {
      quizzes[index] = cloneDeep(quiz);
    } else {
      quizzes.push(cloneDeep(quiz));
    }
    set({ quizzes });
  },
  removeQuiz: (quizId) => {
    const quizzes = get().quizzes;
    const index = quizzes.findIndex((q) => q.id === quizId);
    if (index > -1) {
      quizzes.splice(index, 1);
    }
    set({ quizzes });
  },
}));

export function identityQuestionData<T extends QuestionData>(data: T): T {
  return data;
}

export function identityExpectedAnswer<T extends QuestionExpectedAnswer>(
  data: T,
): T {
  return data;
}

export function identityUserAnswer<T extends QuestionUserAnswer>(data: T): T {
  return data;
}

export default useQuizStore;
