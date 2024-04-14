import styled, { useTheme } from "styled-components";
import { Typography, Tabs } from "antd";
import { t, Trans } from "@lingui/macro";
import React from "react";

import { Text, TextWeight } from "../common/Text";
import DeletedDocumentList from "./DeletedDocumentList";
import DeletedClassList from "./DeletedClassList";

const Trash = () => {
  const theme = useTheme();
  return (
    <TrashContainer>
      <Text weight={TextWeight.bold} level={5} color={theme.colors.gray[9]}>
        <Trans>Recently Deleted</Trans>
      </Text>
      <br />
      <Typography.Text type="secondary">
        <Trans>Item are available for 60 days. After that time, item will be permanently deleted.</Trans>
      </Typography.Text>
      <Tabs>
        <Tabs.TabPane key="Document" tab={t`Document`}>
          <DeletedDocumentList />
        </Tabs.TabPane>
        <Tabs.TabPane key="Space" tab={t`Space`}>
          <DeletedClassList />
        </Tabs.TabPane>
      </Tabs>
    </TrashContainer>
  );
};

const TrashContainer = styled.div`
  margin: 20px;
`;

export default Trash;
