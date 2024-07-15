import create from "zustand";

import {
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_singleChoiceAnswer,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceExpectedAnswer,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceQuestion,
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_writingQuestion,
} from "graphql/types";
import { cloneDeep } from "lodash";

export type IQuiz = GetDocumentQuizzes_documentGet_pages_pageContents_quizzes;

export type IWritingQuestion =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_writingQuestion;

export type ISingleChoiceQuestion =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceQuestion;
export type ISingleChoiceExpectedAnswer =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_singleChoiceExpectedAnswer;
export type ISingleChoiceAnswer =
  GetDocumentQuizzes_documentGet_pages_pageContents_quizzes_myAnswer_singleChoiceAnswer;

export type QuestionData = IWritingQuestion | ISingleChoiceQuestion | {};
export type QuestionExpectedAnswer = ISingleChoiceExpectedAnswer | {};
export type QuestionUserAnswer = ISingleChoiceAnswer | {};

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
