import React, { useState } from "react";
import { Divider, Typography } from "antd";
import { t, Trans } from "@lingui/macro";
import styled, { useTheme } from "styled-components";
import { SettingOutlined } from "@ant-design/icons";

import useAuthUserStore from "context/ZustandAuthStore";
import EditProfileModal from "components/UserCredential/EditProfileModal";
import UserBasicInformation from "components/UserBasicInformation";
import { BreakPoints } from "styles/mediaQuery";
import LearningModuleDnd from "components/common/LearningModuleDnd";
import LessonItemDnd from "components/common/LearningModuleDnd/LessonItemDnd";
import useDocumentStore from "context/DocumentV2Store";
import { Text, TextWeight } from "components/common/Text";
import { SpaceActionPermission } from "graphql/types";
import { TextButtonWithHover } from "components/common/Button";
import usePermission from "hook/UsePermission";
import useSpaceStore from "context/ZustandSpaceStore";

const LeftSide = () => {
  const allow = usePermission();
  const theme = useTheme();
  const me = useAuthUserStore((state) => state.currentUser?.userMe);
  const spaceDocuments = useDocumentStore((state) => state.spaceDocuments);
  const [openProfile, setOpenProfile] = useState(false);
  const setSpaceSettingVisible = useSpaceStore(
    (state) => state.setSpaceSettingVisible,
  );
  const spaceName = useSpaceStore((state) => state.space?.name);

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
          <SpaceInformation>
            <Typography.Paragraph
              style={{ marginTop: 10, flex: 1 }}
              ellipsis={{ rows: 2 }}
              strong
            >
              {spaceName}
            </Typography.Paragraph>
            {allow(SpaceActionPermission.MANAGE_SPACE_SETTING) && (
              <div>
                <TextButtonWithHover
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={() => setSpaceSettingVisible(true)}
                />
              </div>
            )}
          </SpaceInformation>
        </SpaceInfoContainer>
        <NoMarginDivider $margin={0} />
        <div style={{ padding: "10px" }}>
          <Text
            color={theme.colors.gray[6]}
            weight={TextWeight.medium}
            level={2}
          >
            <Trans>Material</Trans>
          </Text>
        </div>
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

const SpaceInfoContainer = styled.div``;

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
  padding: 2px 5px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const SpaceInformation = styled.div`
  display: flex;
  padding: 0 10px 0 15px;
  align-items: baseline;
`;
