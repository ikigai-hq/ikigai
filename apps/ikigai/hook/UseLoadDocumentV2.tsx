import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import toast from "react-hot-toast";
import { t } from "@lingui/macro";

import {
  DocumentActionPermission,
  GetDocuments,
  GetDocumentV2,
  GetPages,
} from "graphql/types";
import { GET_DOCUMENT_V2, GET_PAGES } from "graphql/query/DocumentQuery";
import useDocumentStore from "context/DocumentV2Store";
import { GET_SPACE_INFORMATION } from "graphql/query/SpaceQuery";
import useAuthUserStore from "context/ZustandAuthStore";
import useSpaceStore from "context/ZustandSpaceStore";
import useSpaceMemberStore from "context/ZustandSpaceMembeStore";
import usePageStore from "../context/PageStore";

export const useLoadDocument = (documentId: string) => {
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | undefined>();

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
      await loadAdditionalDocumentInformation(documentId);

      setActiveDocument(data.documentGet);
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
