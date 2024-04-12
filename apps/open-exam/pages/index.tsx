import React from "react";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";

import { Layout } from "components/common/Layout";
import ClassContainer from "../components/ClassListManagement/index";

const ClassesPage: NextPageWithLayout = () => {
  return <ClassContainer />;
};

ClassesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default ClassesPage;
