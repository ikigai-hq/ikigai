import React, { useState } from "react";
import { Divider } from "antd";
import { t } from "@lingui/macro";
import styled from "styled-components";

import useAuthUserStore from "context/ZustandAuthStore";
import EditProfileModal from "components/UserCredential/EditProfileModal";
import UserBasicInformation from "components/UserBasicInformation";
import { BreakPoints } from "styles/mediaQuery";
import LearningModuleDnd from "components/common/LearningModuleDnd";
import LessonItemDnd from "components/common/LearningModuleDnd/LessonItemDnd";
import useDocumentStore from "context/DocumentV2Store";

const LeftSide = () => {
  const me = useAuthUserStore((state) => state.currentUser?.userMe);
  const spaceDocuments = useDocumentStore((state) => state.spaceDocuments);
  const [openProfile, setOpenProfile] = useState(false);

  const myName = me ? `${me.firstName} ${me.lastName}` : t`Unknown`;
  return (
    <Container $hide={false}>
      <div style={{ width: "100%" }}>
        <SpaceInfoContainer>
          <UserBasicInformation
            onClick={() => setOpenProfile(true)}
            name={myName}
            avatar={me?.randomColor}
            randomColor={me?.randomColor}
            email={me?.email}
          />
        </SpaceInfoContainer>
        <NoMarginDivider $margin={0} />
        <ListModule style={{ height: "80%", overflow: "auto" }}>
          <LearningModuleDnd
            docs={spaceDocuments}
            keyword={""}
            TreeItemComponent={LessonItemDnd}
            defaultCollapsed={true}
          />
        </ListModule>
      </div>
      {openProfile && (
        <EditProfileModal
          visible={openProfile}
          onClose={() => setOpenProfile(false)}
        />
      )}
    </Container>
  );
};

export default LeftSide;

const SpaceInfoContainer = styled.div`
  padding: 5px;
`;

const NoMarginDivider = styled(Divider)<{ $margin: number }>`
  margin-top: ${(props) => props.$margin}px;
  margin-bottom: ${(props) => props.$margin}px;
`;

const Container = styled.div<{
  $hide: boolean;
}>`
  min-width: 250px;
  width: 250px;
  display: ${({ $hide }) => ($hide ? "none" : "flex")};
  border-radius: 8px;
  backdrop-filter: blur(12px);
  border: ${({ $hide }) =>
    $hide ? "none" : "1px solid var(--gray-4, #EAECEF)"};
  background: rgba(255, 255, 255, 0.75);
  box-sizing: border-box;
  height: 100%;

  ${BreakPoints.tablet} {
    box-shadow: 0px 0px 20px rgba(19, 48, 122, 0.1);
    width: 100%;
    height: auto;
  }
`;

const ListModule = styled.div`
  padding: 10px 20px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
