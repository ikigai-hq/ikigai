import React, { useState } from "react";
import { Avatar, Divider, Popover, Tooltip, Typography } from "antd";
import { t, Trans } from "@lingui/macro";
import styled, { useTheme } from "styled-components";
import { PlusOutlined } from "@ant-design/icons";

import useAuthUserStore from "context/AuthStore";
import EditProfileModal from "components/UserCredential/EditProfileModal";
import UserBasicInformation from "components/UserBasicInformation";
import { BreakPoints } from "styles/mediaQuery";
import LearningModuleDnd from "components/common/LearningModuleDnd";
import LessonItemDnd from "components/common/LearningModuleDnd/LessonItemDnd";
import useDocumentStore from "context/DocumentStore";
import { Text, TextWeight } from "components/common/Text";
import { TextButtonWithHover } from "components/common/Button";
import useSpaceStore from "context/SpaceStore";
import CreateContentButton from "components/common/LearningModuleDnd/CreateContentButton";
import { ArrowDocument } from "components/common/IconSvg";
import ManageSpace from "./ManageSpace";

const LeftSide = () => {
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
      <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <SpaceInfoContainer>
          <Popover
            trigger={"click"}
            content={
              <ManageSpace
                onClickSpaceSetting={() => setSpaceSettingVisible(true)}
              />
            }
            placement="bottomRight"
            arrow={false}
          >
            <SpaceContainer>
              <Avatar
                size={"small"}
                shape="square"
                style={{ backgroundColor: theme.colors.primary[5] }}
              >
                {spaceName ? spaceName.charAt(0) : "I"}
              </Avatar>
              <Typography.Text ellipsis strong style={{ fontWeight: 700 }}>
                {spaceName}
              </Typography.Text>
              <ArrowDocument style={{ transform: `rotate(270deg)` }} />
            </SpaceContainer>
          </Popover>
        </SpaceInfoContainer>
        <div style={{ padding: "10px", display: "flex" }}>
          <div style={{ flex: 1 }}>
            <Text
              color={theme.colors.gray[6]}
              weight={TextWeight.medium}
              level={2}
            >
              <Trans>Content</Trans>
            </Text>
          </div>
          <CreateContentButton parentId={null}>
            <Tooltip title={t`Add content`} arrow={false}>
              <StyledButton
                icon={<PlusOutlined />}
                type="text"
                size={"small"}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </CreateContentButton>
        </div>
        <ListModule>
          <LearningModuleDnd
            docs={spaceDocuments}
            keyword={""}
            TreeItemComponent={LessonItemDnd}
            defaultCollapsed={true}
          />
        </ListModule>
        <NoMarginDivider $margin={0} />
        <UserBasicInformation
          onClick={() => setOpenProfile(true)}
          name={myName}
          avatar={me?.randomColor}
          randomColor={me?.randomColor}
          email={me?.email}
        />
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
  flex: 1;
`;

const StyledButton = styled(TextButtonWithHover)`
  margin: unset;
  color: #888e9c;
`;

const SpaceContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px 0 10px;
  height: 38px;
  gap: 8px;
  cursor: pointer;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  justify-content: space-between;
  text-align: left;
  background-color: ${(props) => props.theme.colors.gray[3]};
`;
