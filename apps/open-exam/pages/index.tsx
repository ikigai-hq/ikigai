import React from "react";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";

const IndexPage: NextPageWithLayout = () => {
  return <div>Hello</div>;
};

IndexPage.getLayout = function getLayout(page: ReactElement) {
  return <div>{page}</div>;
};

export default IndexPage;
