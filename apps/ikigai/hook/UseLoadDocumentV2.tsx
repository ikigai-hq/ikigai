import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";

import { GetDocuments, GetDocumentV2 } from "graphql/types";
import { GET_DOCUMENT_V2 } from "graphql/query/DocumentQuery";
import useDocumentStore from "context/DocumentV2Store";
import { GET_SPACE_INFORMATION } from "graphql/query/SpaceQuery";
import useAuthUserStore from "context/ZustandAuthStore";
import useSpaceStore from "../context/ZustandSpaceStore";
import useSpaceMemberStore from "../context/ZustandSpaceMembeStore";

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

  const [fetchDocument] = useLazyQuery<GetDocumentV2>(GET_DOCUMENT_V2, {
    fetchPolicy: "network-only",
  });
  const [fetchSpaceDocuments] = useLazyQuery<GetDocuments>(
    GET_SPACE_INFORMATION,
    {
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
    await fetchDocumentPermissions(documentId);
    const { data, error } = await fetchDocument({
      variables: {
        documentId,
      },
    });

    if (data) {
      const spaceId = data.documentGet.spaceId;
      setActiveDocument(data.documentGet);
      if (spaceId) await fetchSpaceInformation(spaceId);
    }

    if (error) {
      setLoadingError(error.message);
    }
    setLoading(false);
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
