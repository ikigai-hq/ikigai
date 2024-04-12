export type QuizAttrs = {
  quizId?: string;
  quizTitle?: string;
  quizNumber?: number;
  originalQuizId?: string;
  quizzType?: string;
};

export enum ViewMode {
  Default,
  Report,
  StudentAnswer,
}

export interface Content {
  type: string;
  text: string;
  attrs?: Record<string, any>;
}

export interface SliceNode {
  attrs?: Record<string, any>;
  type: string;
  content: Content[];
}
