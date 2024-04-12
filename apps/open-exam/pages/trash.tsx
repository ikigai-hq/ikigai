import React from "react";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";

import { Layout } from "components/common/Layout";
import Trash from "../components/Trash";
import { AuthenticatedWrapper } from "components/Authenticate/AuthenticateWrapper";

const OrganizationPage: NextPageWithLayout = () => {
  return (
    <AuthenticatedWrapper>
      <Trash />
    </AuthenticatedWrapper>
  );
};

OrganizationPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default OrganizationPage;
