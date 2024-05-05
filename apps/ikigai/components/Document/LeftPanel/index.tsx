import React, { useState } from "react";
import shallow from "zustand/shallow";
import { Divider, Tooltip, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { t, Trans } from "@lingui/macro";
import styled, { useTheme } from "styled-components";

import useDocumentStore from "context/ZustandDocumentStore";
import {
  GetDocuments_spaceGet_documents,
  SpaceActionPermission,
} from "graphql/types";
import { Text, TextWeight } from "components/common/Text";
import CreateContentButton from "./CreateContentButton";
import { ListModule, TitlePanel } from "./common";
import { RightBodyContainer } from "../common";
import LearningModuleDnd from "components/common/LearningModuleDnd";
import LessonItemDnd from "./LessonItemDnd";
import useSpaceStore from "context/ZustandSpaceStore";
import { TextButtonWithHover } from "components/common/Button";
import useAuthUserStore from "context/ZustandAuthStore";
import EditProfileModal from "../../UserCredential/EditProfileModal";
import UserBasicInformation from "../../UserBasicInformation";
import usePermission from "hook/UsePermission";

interface Props {
  docs: GetDocuments_spaceGet_documents[];
}

const LeftPanel: React.FC<Props> = ({ docs }) => {
  const theme = useTheme();
  const allow = usePermission();
  const leftPanelHidden = useDocumentStore(
    (state) => state.leftPanelHidden,
    shallow,
  );
  const space = useSpaceStore((state) => state.space);
  const me = useAuthUserStore((state) => state.currentUser?.userMe);
  const [openProfile, setOpenProfile] = useState(false);
  const setSpaceSettingVisible = useSpaceStore(
    (state) => state.setSpaceSettingVisible,
  );

  const myName = me ? `${me.firstName} ${me.lastName}` : t`Unknown`;
  return (
    <RightBodyContainer $hide={leftPanelHidden} $leftPanel={true}>
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
              {space?.name}
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
        {allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) && (
          <TitlePanel>
            <Text
              color={theme.colors.gray[6]}
              weight={TextWeight.medium}
              level={2}
            >
              <Trans>Documents</Trans>
            </Text>
            <Tooltip
              trigger="hover"
              placement="bottom"
              title={
                <Text level={2} color={theme.colors.gray[0]}>
                  New Module
                </Text>
              }
            >
              <CreateContentButton parentId={null} onlyIcon={true} />
            </Tooltip>
          </TitlePanel>
        )}
        <ListModule style={{ height: "80%", overflow: "auto" }}>
          {docs && (
            <LearningModuleDnd
              docs={docs}
              keyword={""}
              TreeItemComponent={LessonItemDnd}
              defaultCollapsed={true}
            />
          )}
        </ListModule>
      </div>
      {openProfile && (
        <EditProfileModal
          visible={openProfile}
          onClose={() => setOpenProfile(false)}
        />
      )}
    </RightBodyContainer>
  );
};

export default LeftPanel;

const SpaceInfoContainer = styled.div`
  padding: 5px;
`;

const SpaceInformation = styled.div`
  display: flex;
  padding: 0 10px 0 15px;
  align-items: baseline;
`;

const NoMarginDivider = styled(Divider)<{ $margin: number }>`
  margin-top: ${(props) => props.$margin}px;
  margin-bottom: ${(props) => props.$margin}px;
`;
