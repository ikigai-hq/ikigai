import React, { useState } from "react";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";

import styled from "styled-components";

import { Button } from "components/common/Button";
import BasicInformation from "components/ProfileSetting/BasicInformation";
import Contact from "components/ProfileSetting/Contact";
import { LayoutProfile } from "components/ProfileSetting/Layout";

import { Layout } from "components/common/Layout";
import { Trans } from "@lingui/macro";
import useAuthUserStore from "context/ZustandAuthStore";

const FixedActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  align-items: center;
  bottom: 0px;
  right: 0px;
  padding: 32px 0px;
`;

const ButtonGroup = () => {
  const { onSubmitUpdateUserData, refreshUpdateUserData } = useAuthUserStore();

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await onSubmitUpdateUserData();
    setLoading(false);
  };

  return (
    <FixedActions>
      <Button onClick={() => refreshUpdateUserData()}>
        <Trans>Cancel</Trans>
      </Button>
      <Button
        onClick={submit}
        type="primary"
        loading={loading}
        disabled={loading}
      >
        <Trans>Save</Trans>
      </Button>
    </FixedActions>
  );
};

const MyAccountPage: NextPageWithLayout = () => {
  return (
    <>
      <BasicInformation />
      <Contact />
      <ButtonGroup />
    </>
  );
};

MyAccountPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <LayoutProfile>{page}</LayoutProfile>
    </Layout>
  );
};

export default MyAccountPage;
