import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";

import {
  DocumentType,
  GetDocument,
  GetDocumentPageContents,
  GetDocumentQuizzes,
  GetDocuments,
  GetPages,
  GetRubrics,
  GetSubmissionsOfAssignment,
} from "graphql/types";
import {
  GET_DOCUMENT,
  GET_DOCUMENT_PAGE_CONTENT,
  GET_PAGES,
} from "graphql/query/DocumentQuery";
import useDocumentStore from "store/DocumentStore";
import { GET_SPACE_INFORMATION } from "graphql/query/SpaceQuery";
import useAuthUserStore from "store/AuthStore";
import useSpaceStore from "store/SpaceStore";
import useSpaceMemberStore from "store/SpaceMembeStore";
import usePageStore from "store/PageStore";
import usePageContentStore from "store/PageContentStore";
import useUIStore, { getUIConfig } from "store/UIStore";
import {
  GET_RUBRICS,
  GET_SUBMISSIONS_OF_ASSIGNMENT,
} from "graphql/query/AssignmentQuery";
import { handleError } from "graphql/ApolloClient";
import useRubricStore from "store/RubricStore";
import { GET_DOCUMENT_QUIZZES } from "graphql/query/QuizQuery";
import useQuizStore from "store/QuizStore";

export const useLoadDocument = (documentId: string) => {
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | undefined>();

  const role = useAuthUserStore((state) => state.role);
  const activeDocument = useDocumentStore((state) => state.activeDocument);
  const setActiveDocument = useDocumentStore(
    (state) => state.setActiveDocument,
  );
  const setActivePage = usePageStore((state) => state.setActivePageId);
  const setSpaceDocuments = useDocumentStore(
    (state) => state.setSpaceDocuments,
  );
  const fetchSpacePermissions = useAuthUserStore(
    (state) => state.fetchSpacePermissions,
  );
  const setSpace = useSpaceStore((state) => state.setSpace);
  const fetchSpaceMembers = useSpaceMemberStore(
    (state) => state.fetchMembersOfSpace,
  );
  const setPages = usePageStore((state) => state.setPages);
  const setPageContents = usePageContentStore((state) => state.setPageContents);
  const setUIConfig = useUIStore((state) => state.setConfig);
  const setRubrics = useRubricStore((state) => state.setRubrics);
  const setSubmissions = useDocumentStore((state) => state.setSubmissions);
  const setQuizzes = useQuizStore((state) => state.setQuizzes);

  const [fetchDocument] = useLazyQuery<GetDocument>(GET_DOCUMENT, {
    fetchPolicy: "network-only",
  });
  const [fetchSpaceDocuments] = useLazyQuery<GetDocuments>(
    GET_SPACE_INFORMATION,
    {
      fetchPolicy: "network-only",
    },
  );
  const [fetchPages] = useLazyQuery<GetPages>(GET_PAGES, {
    fetchPolicy: "network-only",
  });
  const [fetchPageContents] = useLazyQuery<GetDocumentPageContents>(
    GET_DOCUMENT_PAGE_CONTENT,
    {
      fetchPolicy: "network-only",
    },
  );
  const [fetchRubrics] = useLazyQuery<GetRubrics>(GET_RUBRICS, {
    onError: handleError,
  });
  const [fetchSubmissions] = useLazyQuery<GetSubmissionsOfAssignment>(
    GET_SUBMISSIONS_OF_ASSIGNMENT,
    {
      onError: handleError,
      fetchPolicy: "network-only",
    },
  );
  const [fetchQuizzes] = useLazyQuery<GetDocumentQuizzes>(
    GET_DOCUMENT_QUIZZES,
    {
      onError: handleError,
      fetchPolicy: "network-only",
    },
  );

  useEffect(() => {
    if (activeDocument?.id != documentId) {
      load();
    }
  }, [documentId]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await fetchDocument({
      variables: {
        documentId,
      },
    });

    if (data) {
      const spaceId = data.documentGet.spaceId;
      if (spaceId) await fetchSpaceInformation(spaceId);
      setActiveDocument(data.documentGet);
      await Promise.all([
        await loadAdditionalDocumentInformation(
          documentId,
          data.documentGet.documentType,
        ),
        await loadAssignmentInformation(data.documentGet.assignment?.id),
      ]);
      setUIConfig(getUIConfig(data.documentGet, role));
    }

    if (error) {
      setLoadingError(error.message);
    }
    setLoading(false);
  };

  const loadAdditionalDocumentInformation = async (
    documentId: string,
    documentType: DocumentType,
  ) => {
    const { data } = await fetchPages({
      variables: {
        documentId,
      },
    });
    if (data) {
      setPages(data.documentGet.pages);
      if (documentType === DocumentType.SUBMISSION) {
        setActivePage(data.documentGet.pages[0]?.id);
      } else {
        setActivePage(undefined);
      }
    }

    const { data: pageContentsData } = await fetchPageContents({
      variables: {
        documentId,
      },
    });
    if (data) {
      const pageContents = pageContentsData.documentGet.pages.flatMap(
        (page) => page.pageContents,
      );
      setPageContents(pageContents);
    }

    const { data: quizzesData } = await fetchQuizzes({
      variables: {
        documentId,
      },
    });
    if (quizzesData) {
      const quizzes = quizzesData.documentGet.pages.flatMap((page) =>
        page.pageContents.flatMap((pageContent) => pageContent.quizzes),
      );
      setQuizzes(quizzes);
    }

    const { data: rubricData } = await fetchRubrics();
    if (rubricData) setRubrics(rubricData.userGetMyRubrics);
  };

  const loadAssignmentInformation = async (assignmentId?: number) => {
    if (!assignmentId) return;

    const { data } = await fetchSubmissions({
      variables: {
        assignmentId,
      },
    });

    if (data) setSubmissions(data.assignmentGetSubmissions);
  };

  const fetchSpaceInformation = async (spaceId: number) => {
    await fetchSpacePermissions(spaceId);
    const { data } = await fetchSpaceDocuments({
      variables: {
        spaceId,
      },
    });

    if (data) {
      setSpace(data.spaceGet);
      setSpaceDocuments(data.spaceGet.documents);
      await fetchSpaceMembers(data.spaceGet.id);
    }
  };

  return {
    loading,
    loadingError,
    activeDocument,
  };
};
