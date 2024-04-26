import React from "react";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "pages/_app";
import LayoutManagement from "components/UserCredential/AuthLayout";
import PreJoinSpace from "components/PreJoinSpace";

const PreJoinSpacePage: NextPageWithLayout = () => {
  return <PreJoinSpace />;
};

PreJoinSpacePage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutManagement>{page}</LayoutManagement>;
};

export default PreJoinSpacePage;
