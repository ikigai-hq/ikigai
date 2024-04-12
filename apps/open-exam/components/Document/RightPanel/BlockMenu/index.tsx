import { t } from "@lingui/macro";
import { ConfigProvider, Tabs, TabsProps } from "antd";
import React from "react";
import styled from "styled-components";
import { InsertBlocks } from "./InsertBlocks";
import { TextStyles } from "./TextStyles";

const blockMenuItems: TabsProps["items"] = [
  {
    key: "insert-block",
    label: t`Insert Blocks`,
    children: <InsertBlocks />,
  },
  {
    key: "text-styles",
    label: t`Text Styles`,
    children: <TextStyles />,
  },
];

export const BlockMenu: React.FC = () => {
  return (
    <BlockMenuContainer>
      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              itemSelectedColor: "#181E2D",
              itemHoverColor: "#888E9C",
              inkBarColor: "#181E2D",
            },
          },
        }}
      >
        <Tabs centered items={blockMenuItems} defaultActiveKey="insert-block" />
      </ConfigProvider>
    </BlockMenuContainer>
  );
};

const BlockMenuContainer = styled.div`
  width: 100%;
  overflow: hidden;

  .ant-tabs, .ant-tabs-content-holder, .ant-tabs-content, .ant-tabs-tabpane {
    height: 100%;
  }

  .ant-tabs-nav-wrap ::before {
    width: 0 !important;
  }

  .ant-tabs-nav-wrap ::after {
    width: 0 !important;
  }

  .ant-tabs-nav {
    width: 100% !important;
  }

  .ant-tabs-tab {
    display: block; /* centers text inside tabs */
    flex: 1;
    text-align: center;
    margin: 0;
  }

  .ant-tabs-tab-active {
    border-bottom: 2px solid;
  }

  .ant-tabs-nav > div:nth-of-type(1) {
    display: unset !important;
    width: 100% !important;
  }

  .ant-tabs-ink-bar {
    /* width: 50% !important; */
    display: none;
  }

  .ant-tabs-nav-operations {
    display: none !important;
  }
`;
