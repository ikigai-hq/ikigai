import React from "react";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";

import { LayoutProfile } from "components/ProfileSetting/Layout";
import SecuritySettings from "components/ProfileSetting/SecuritySettings";
import { Layout } from "components/common/Layout";

const SecuritySettingsPage: NextPageWithLayout = () => {
  return <SecuritySettings />;
};

SecuritySettingsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <LayoutProfile>{page}</LayoutProfile>
    </Layout>
  );
};

export default SecuritySettingsPage;
