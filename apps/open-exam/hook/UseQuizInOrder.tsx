import useDocumentStore from "context/ZustandDocumentStore";
import usePageBlockStore from "context/ZustandPageBlockStore";
import useQuizStore from "context/ZustandQuizStore";
import { getZenBlocksInOrder } from "util/BlockUtil";
import { ExtensionName } from "@openexam/editor/dist/types/extensions.enum";

export const useQuizzesInOrder = () => {
  const masterDocument = useDocumentStore((state) => state.masterDocument);
  const quizBlocks = useQuizStore((state) => state.mapQuizBlockData);
  const quizzes = useQuizStore((state) => state.quizzes);
  const pageBlocks = usePageBlockStore((state) =>
    state.mapPageBlockData
      .get(masterDocument?.id)
      ?.map((pb) => state.pageBlocks.find((n) => n.id === pb?.id)),
  );
  const blocksInOrder = getZenBlocksInOrder(masterDocument?.body);
  const orderingQuiz: {
    quizId: string;
    documentId: number;
    pageBlockId?: string;
    nestedDocumentIndex?: number;
  }[] = [];
  blocksInOrder.forEach((b) => {
    if (b.type === ExtensionName.Quizz) {
      orderingQuiz.push({
        quizId: b.id,
        documentId: quizzes.get(b.id)?.documentId,
      });
    } else {
      const nestedDocs = pageBlocks?.find(
        (pb) => pb?.id === b.id,
      )?.nestedDocuments;
      if (nestedDocs) {
        nestedDocs.forEach((d) => {
          const quizzes = quizBlocks.get(d.documentId);
          if (quizzes?.length) {
            orderingQuiz.push(
              ...quizzes.map((q) => ({
                quizId: q.id,
                documentId: d.documentId,
                nestedDocumentIndex: d.index,
                pageBlockId: d.pageBlockId,
              })),
            );
          }
        });
      }
    }
  });

  return orderingQuiz;
};
