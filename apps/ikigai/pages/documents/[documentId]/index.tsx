import React, { useEffect } from "react";

import DocumentDetail from "components/Document/DocumentDetail";
import userMediaPermission from "../../../hook/UserMediaPermission";
import useDocumentStore from "context/ZustandDocumentStore";
import { NextPageWithLayout } from "pages/_app";
import useSpaceStore from "context/ZustandSpaceStore";
import Loading from "components/Loading";
import { useRouter } from "next/router";
import ServerDocumentFetchError from "components/Document/ServerDocumentFetchError";
import { useLoadDocument } from "hook/UseLoadDocument";
import Config from "config/Config";
import DocumentPageV2 from "components/DocumentV2";

const DocumentPageV1 = () => {
  useDocumentStore.setState({ isPreviewMode: false });
  const router = useRouter();
  const {
    query: { documentId },
  } = router;
  const setPermissions = useDocumentStore((state) => state.setPermissions);
  const masterDocument = useDocumentStore((state) => state.masterDocument);
  const fetchError = useDocumentStore((state) => state.fetchError);
  const spaceId = useSpaceStore((state) => state.spaceId);
  const microphone = userMediaPermission("microphone" as PermissionName);
  const camera = userMediaPermission("camera" as PermissionName);
  const { error } = useLoadDocument(documentId as string);

  useEffect(() => {
    setPermissions({ camera, microphone });
  }, [camera, microphone]);

  if (fetchError || error)
    return (
      <ServerDocumentFetchError
        fetchError={fetchError || error}
        showBackToHome
      />
    );

  if (!masterDocument || !spaceId) return <Loading />;

  return <DocumentDetail />;
};
const DocumentPage: NextPageWithLayout = () => {
  if (Config.enableDocumentV2) return <DocumentPageV2 />;

  return <DocumentPageV1 />;
};

export default DocumentPage;
