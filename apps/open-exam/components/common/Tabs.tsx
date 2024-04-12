import { Tabs as TabsAnt } from "antd";
import styled from "styled-components";

export const Tabs = styled(TabsAnt)`
  .ant-tabs-nav {
    margin-bottom: 24px;
  }

  .ant-tabs-tab {
    &:hover {
      // color: ${(props) => props.theme.colors.blue[5]};
    }
  }

  .ant-tabs-tab-active {
    .ant-tabs-tab-btn {
      font-weight: 700;
      // color: ${(props) => props.theme.colors.blue[5]};
    }
  }

  .ant-tabs-ink-bar {
    // background: ${(props) => props.theme.colors.blue[5]};
  }
`;
