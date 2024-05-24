import { useEffect, useState } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import toast from "react-hot-toast";
import { t } from "@lingui/macro";

import {
  DocumentActionPermission,
  GetDocumentPageContents,
  GetDocuments,
  GetDocumentV2,
  GetPages,
  GetRubrics,
  GetSubmissionsOfAssignment,
} from "graphql/types";
import {
  GET_DOCUMENT_PAGE_CONTENT,
  GET_DOCUMENT_V2,
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

export const useLoadDocument = (documentId: string) => {
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | undefined>();

  const role = useAuthUserStore((state) => state.role);
  const activeDocument = useDocumentStore((state) => state.activeDocument);
  const setActiveDocument = useDocumentStore(
    (state) => state.setActiveDocument,
  );
  const setSpaceDocuments = useDocumentStore(
    (state) => state.setSpaceDocuments,
  );
  const fetchDocumentPermissions = useAuthUserStore(
    (state) => state.fetchDocumentPermissions,
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

  const [fetchDocument] = useLazyQuery<GetDocumentV2>(GET_DOCUMENT_V2, {
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

  useEffect(() => {
    if (activeDocument?.id != documentId) {
      load();
    }
  }, [documentId]);

  const load = async () => {
    setLoading(true);
    const permissions = await fetchDocumentPermissions(documentId);
    if (!permissions.includes(DocumentActionPermission.VIEW_DOCUMENT)) {
      // Move to sign-in page
      toast.error(
        t`You don't have access to this document, redirecting to home page...`,
      );
      window.location.replace("/");
      return;
    }

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
        await loadAdditionalDocumentInformation(documentId),
        await loadAssignmentInformation(data.documentGet.assignment?.id),
      ]);
      setUIConfig(getUIConfig(data.documentGet.documentType, role));
    }

    if (error) {
      setLoadingError(error.message);
    }
    setLoading(false);
  };

  const loadAdditionalDocumentInformation = async (documentId: string) => {
    const { data } = await fetchPages({
      variables: {
        documentId,
      },
    });
    if (data) setPages(data.documentGet.pages);

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

    console.log("Hello", data);
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
