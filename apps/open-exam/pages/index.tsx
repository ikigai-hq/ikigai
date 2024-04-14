import React from "react";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import LayoutManagement from "../components/UserCredential/AuthLayout";
import MagicLink from "../components/MagicLink";

const IndexPage: NextPageWithLayout = () => {
  return (
    <MagicLink />
  );
};

IndexPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutManagement>{page}</LayoutManagement>;
};

export default IndexPage;
