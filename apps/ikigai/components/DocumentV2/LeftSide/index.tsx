import React, { useState } from "react";
import shallow from "zustand/shallow";
import { Divider } from "antd";
import { t } from "@lingui/macro";
import styled from "styled-components";

import useDocumentStore from "context/ZustandDocumentStore";
import { GetDocuments_spaceGet_documents } from "graphql/types";
import useAuthUserStore from "context/ZustandAuthStore";
import EditProfileModal from "components/UserCredential/EditProfileModal";
import UserBasicInformation from "components/UserBasicInformation";
import { BreakPoints } from "styles/mediaQuery";

interface Props {
  docs: GetDocuments_spaceGet_documents[];
}

const LeftSide: React.FC<Props> = () => {
  const leftPanelHidden = useDocumentStore(
    (state) => state.leftPanelHidden,
    shallow,
  );
  const me = useAuthUserStore((state) => state.currentUser?.userMe);
  const [openProfile, setOpenProfile] = useState(false);

  const myName = me ? `${me.firstName} ${me.lastName}` : t`Unknown`;
  return (
    <Container $hide={leftPanelHidden}>
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
  min-width: 277px;
  width: 277px;
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
