import React, { type ReactElement } from "react";

import { NextPageWithLayout } from "pages/_app";
import LayoutManagement from "components/UserCredential/AuthLayout";
import ShareDocument from "components/ShareDocument";
import { useRouter } from "next/router";
import Loading from "components/Loading";

const SharePage: NextPageWithLayout = () => {
  const router = useRouter();
  const sessionId = router.query.sessionId as string;
  const documentId = router.query.documentId as string;
  const readOnly = (router.query.readOnly as string) === "true";

  if (!sessionId || !documentId) return <Loading />;

  return (
    <ShareDocument
      sessionId={sessionId}
      documentId={documentId}
      readOnly={readOnly}
    />
  );
};

SharePage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutManagement>{page}</LayoutManagement>;
};

export default SharePage;
