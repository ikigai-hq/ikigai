import create from "zustand";

import { GetDocumentQuizzes_documentGet_pages_pageContents_quizzes } from "graphql/types";
import { cloneDeep } from "lodash";

export type IQuiz = GetDocumentQuizzes_documentGet_pages_pageContents_quizzes;

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

export default useQuizStore;
