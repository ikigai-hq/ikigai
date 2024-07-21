import React from "react";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "pages/_app";
import LayoutManagement from "components/UserCredential/AuthLayout";
import EmptySpace from "components/EmptySpace";
import { useRouter } from "next/router";

const EmptySpacePage: NextPageWithLayout = () => {
  const router = useRouter();
  const spaceIdStr = router.query.spaceId as string;
  const spaceId = parseInt(spaceIdStr);
  return <EmptySpace spaceId={spaceId} />;
};

EmptySpacePage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutManagement>{page}</LayoutManagement>;
};

export default EmptySpacePage;
