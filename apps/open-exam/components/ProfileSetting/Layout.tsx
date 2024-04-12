import React from "react";

import styled from "styled-components";

import ProfileLeftMenu from "components/ProfileSetting/ProfileLeftMenu";

import PageTitle from "../common/PageTitle";
import { t } from "@lingui/macro";

interface Props {
  children: React.ReactNode;
}

const ChildrenBox = styled.div`
  width: 100%;
`;

const ProfileContainer = styled.div`
  display: flex;
  gap: 70px;
  min-height: calc(100vh - 205px);
`;

export const LayoutProfile: React.FC<Props> = ({ children }) => {
  return (
    <>
      <PageTitle isBack={false} title={t`My Profile`} readOnly />
      <ProfileContainer>
        <ProfileLeftMenu />
        <ChildrenBox>{children}</ChildrenBox>
      </ProfileContainer>
    </>
  );
};
