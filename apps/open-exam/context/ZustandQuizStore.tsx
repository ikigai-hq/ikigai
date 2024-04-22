import {
  CreateQuizStructure_quizCreateStructure as ICreateQuizStructure,
  GetDocumentDetail_documentGet_quizzes as IDocumentQuiz,
  GetDocumentDetail_documentGet_quizzes_structure as IDocumentQuizStructure,
  GetPageBlocks_documentGet_pageBlocks as IDocumentPageBlock,
  GetDocumentDetail_documentGet as IDocument,
} from "graphql/types";
import { BlockData, Metadata, parseQuizBlock } from "util/BlockUtil";
import create from "zustand";
import { omit } from "lodash";

export type IQuizStore = {
  // Map<quizId, IDocumentQuiz>
  quizzes: Map<string, IDocumentQuiz>;
  // Map<documentId, BlockData[]>
  mapQuizBlockData: Map<string, BlockData[]>;
  syncQuizzes: (body: string, documentId?: string) => void;
  updateQuizzes: (
    quizzes: IDocumentQuiz[],
    quizData?: Partial<IDocumentQuiz>,
  ) => void;
  updateStructureQuizzes: (
    quizId: string,
    changedQuizData: ICreateQuizStructure,
    structureAnswer?: any,
    structureExplanation?: string,
  ) => Promise<void>;
  countUncompletedQuizzes: (
    activeDocument: IDocument,
    pageBlocks: IDocumentPageBlock[],
  ) => BlockData[];
  updateStore: (
    quizId: string,
    metadata: Partial<Metadata>,
    documentId?: string,
  ) => void;
  resetStore: () => void;
};

const useQuizStore = create<IQuizStore>((set, get) => ({
  mapQuizBlockData: new Map(),
  quizzes: new Map(),
  syncQuizzes: (body, documentId?) => {
    const parsedQuizzes = parseQuizBlock(body);
    const currentMapQuiz = get().mapQuizBlockData.get(documentId);
    if (checkTwoQuizzes(parsedQuizzes, currentMapQuiz)) {
      set(({ mapQuizBlockData }) => {
        const instances = new Map(mapQuizBlockData);
        return { mapQuizBlockData: instances.set(documentId, parsedQuizzes) };
      });
    }
  },
  updateQuizzes: (quizzes, quizData) => {
    set(({ quizzes: oldQuizzes }) => {
      const addedQuizzes: Map<string, IDocumentQuiz> = new Map(
        quizzes.map((quiz) => [quiz.id, quiz]),
      );
      const newQuizzes = new Map([...oldQuizzes, ...addedQuizzes]);
      if (quizData) {
        const existingQuizData = newQuizzes.get(quizData.id);
        newQuizzes.set(existingQuizData.id, {
          ...existingQuizData,
          ...quizData,
        });
      }
      return {
        quizzes: newQuizzes,
      };
    });
  },
  updateStructureQuizzes: async (
    quizId: string,
    changedQuizData: ICreateQuizStructure,
    structureAnswer: any,
    structureExplanation: string,
  ) => {
    const quizzes = get().quizzes;
    const quizInfo = quizzes.get(quizId);
    const updatedStructureField: IDocumentQuizStructure = {
      ...quizInfo.structure,
      ...omit(changedQuizData, ["orgId"]),
    };
    if (quizInfo) {
      quizzes.set(quizId, {
        ...quizInfo,
        structure: updatedStructureField,
        structureAnswer,
        structureExplanation,
      });
    }
    set({ quizzes });
  },
  updateStore: (quizId, metadata, documentId?) => {
    const quizzes = [...get().mapQuizBlockData.get(documentId)];
    if (quizzes) {
      const quizIndex = quizzes.findIndex((quiz) => quiz.id === quizId);
      if (quizIndex > -1) {
        const oldQuiz = quizzes[quizIndex];
        const oldMetadata = oldQuiz?.metadata;
        quizzes[quizIndex] = {
          id: oldQuiz?.id,
          content: oldQuiz?.content,
          metadata: {
            ...oldMetadata,
            answer: { ...oldMetadata?.answer, ...metadata?.answer },
          },
        };
      }
      set((state) => {
        const instanceMapQuizBlockData = new Map(state.mapQuizBlockData);
        instanceMapQuizBlockData.set(documentId, quizzes);
        return {
          mapQuizBlockData: instanceMapQuizBlockData,
        };
      });
    }
  },
  resetStore: () => {
    set({ quizzes: new Map(), mapQuizBlockData: new Map() });
  },
  countUncompletedQuizzes: (activeDocument, pageBlocks) => {
    if (pageBlocks?.length) {
      const quizzes: BlockData[] = [];
      pageBlocks.forEach((p) =>
        p.nestedDocuments.forEach((d) => {
          quizzes.push(
            ...get()
              .mapQuizBlockData.get(d.documentId)
              ?.filter((q) => !q?.metadata?.answer?.isAnswered),
          );
        }),
      );
      return quizzes;
    }
    return get()
      .mapQuizBlockData.get(activeDocument.id)
      ?.filter((quizz) => !quizz.metadata?.answer.isAnswered);
  },
}));

const checkTwoQuizzes = (
  quizzes: BlockData[],
  secondQuizzes: BlockData[],
): boolean => {
  if (quizzes.length !== secondQuizzes?.length) return true;
  return quizzes.some((quizz, index) => secondQuizzes[index].id !== quizz.id);
};

export default useQuizStore;
