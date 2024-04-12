import useClassMemberStore from "context/ZustandClassMembeStore";
import useClassStore from "context/ZustandClassStore";
import useDocumentStore, {
  getClassIdFromDocument,
} from "context/ZustandDocumentStore";
import usePageBlockStore from "context/ZustandPageBlockStore";
import useQuizStore from "context/ZustandQuizStore";
import {
  QuizType,
  GetDocumentDetail_documentGet_quizzes as IDocumentQuiz,
} from "graphql/types";
import { useEffect, useState } from "react";
import { Metadata, parsePageBlock } from "util/BlockUtil";
import useAuthUserStore from "../context/ZustandAuthStore";
import useHighlightStore from "context/ZustandHighlightStore";

type ILoadDocument = {
  loading: boolean;
  error: string;
};

export const useLoadDocument = (documentId?: string): ILoadDocument => {
  const currentUser = useAuthUserStore((state) => state.currentUser);
  const fetchAndSetDocument = useDocumentStore(
    (state) => state.fetchAndSetDocument,
  );
  const setMasterDocument = useDocumentStore(
    (state) => state.setMasterDocument,
  );
  const updateMapAvailableDocument = useDocumentStore(
    (state) => state.updateMapAvailableDocument,
  );

  const classId = useClassStore((state) => state.classId);

  const updateQuizzes = useQuizStore((state) => state.updateQuizzes);
  const syncQuizzes = useQuizStore((state) => state.syncQuizzes);

  const updateQuizStore = useQuizStore((state) => state.updateStore);
  const resetStore = useQuizStore((state) => state.resetStore);
  useQuizStore((state) => state.quizzes);

  const getPageBlocks = usePageBlockStore((state) => state.getPageBlocks);
  const syncPageBlocks = usePageBlockStore((state) => state.syncPageBlocks);
  const updatePageBlockMode = usePageBlockStore(
    (state) => state.updatePageBlockMode,
  );

  const fetchAndSetDocuments = useClassStore(
    (state) => state.fetchAndSetDocuments,
  );
  const fetchClassMembers = useClassMemberStore(
    (state) => state.fetchMembersOfClass,
  );

  const syncHighlights = useHighlightStore((state) => state.syncHighlights);
  const getThreads = useHighlightStore((state) => state.getThreads);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDocumentDetail = async () => {
    const masterDocument = await fetchAndSetDocument(documentId);
    const classId = getClassIdFromDocument(masterDocument);
    setMasterDocument(masterDocument);
    useClassStore.setState({ classId });

    // set initial current page block id.
    const parsedPageBlocks = parsePageBlock(masterDocument.body);
    if (parsedPageBlocks.length) {
      usePageBlockStore.setState({
        currentPageBlockId: parsedPageBlocks[0]?.id,
      });
    }

    // get threads of master document.
    await getThreads(masterDocument.id);

    // sync initial quiz block data.
    syncQuizzes(masterDocument.body, masterDocument.id);

    // sync initial page block data.
    syncPageBlocks(masterDocument.body, masterDocument.id);
    syncHighlights(masterDocument.body, masterDocument.id);
    updateQuizzes(masterDocument.quizzes);

    return masterDocument.quizzes;
  };

  const loadDocumentMaterial = async () => {
    setLoading(true);
    try {
      const [nestedDocuments, quizzes] = await Promise.all([
        getPageBlocks(documentId),
        fetchDocumentDetail(),
      ]);
      const nestedDocQuizzes = new Map();
      nestedDocuments.forEach(async (d) => {
        updateMapAvailableDocument(d.documentGet.id, d.documentGet);
        syncQuizzes(d.documentGet.body, d.documentGet.id);
        syncHighlights(d.documentGet.body, d.documentGet.id);
        updateQuizzes(d.documentGet.quizzes);
        d.documentGet.quizzes.forEach((q) => {
          nestedDocQuizzes.set(q.id, q);
        });
        await getThreads(d.documentGet.id);
      });
      const initialMasterDocumentQuizzes: Map<string, IDocumentQuiz> = new Map(
        quizzes.map((q) => [q.id, q]),
      );
      const combinedQuizzes: Map<string, IDocumentQuiz> = new Map([
        ...initialMasterDocumentQuizzes,
        ...nestedDocQuizzes,
      ]);

      combinedQuizzes.forEach((quiz) => {
        const answer = quiz.myAnswer?.answer?.answer;
        const quizStructure = quiz?.structure;
        let singleChoiceIndexAnswer = undefined;

        if (
          answer &&
          quizStructure &&
          quizStructure.quizType === QuizType.SINGLE_CHOICE
        ) {
          const options = quizStructure.quizBody
            ? [...quizStructure.quizBody]
            : [];
          singleChoiceIndexAnswer = options.indexOf(answer);
        }

        const metadata: Metadata = {
          answer: {
            isAnswered: !!quiz.myAnswer?.answer?.answer,
            isCorrect: undefined,
            indexAnswer: singleChoiceIndexAnswer,
            multipleIndexAnswer: answer ? (answer as number[]) : [],
            fillInBlankAnswer: answer ? (answer as string) : "",
          },
        };
        updateQuizStore(quiz.id, metadata, quiz.documentId);
      });
    } catch (reason) {
      setError(reason);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId && currentUser?.userMe?.id) {
      resetStore();
      loadDocumentMaterial();
      updatePageBlockMode(false);
      useDocumentStore.setState({ masterDocumentId: documentId });
    }
  }, [documentId, currentUser?.userMe?.id]);

  useEffect(() => {
    if (classId) {
      fetchAndSetDocuments(classId);
      fetchClassMembers(classId);
    }
  }, [classId]);

  useEffect(
    () => useDocumentStore.setState({ loadingDocumentMaterial: loading }),
    [loading],
  );

  return {
    error,
    loading,
  };
};
