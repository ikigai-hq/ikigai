import React from "react";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";

import { Layout } from "components/common/Layout";
import Organization from "components/Organization";
import { AuthenticatedWrapper } from "components/Authenticate/AuthenticateWrapper";

const OrganizationPage: NextPageWithLayout = () => {
  return (
    <AuthenticatedWrapper>
      <Organization />
    </AuthenticatedWrapper>
  );
};

OrganizationPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default OrganizationPage;
