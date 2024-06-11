import { Drawer as DrawerAntd } from "antd";
import styled from "styled-components";

export const Drawer = styled(DrawerAntd)`
  .ant-drawer-content-wrapper {
    border-radius: 12px 0px 0px 12px;
    overflow: hidden;
  }

  .ant-drawer-mask {
    background: ${(props) => props.theme.colors.gray[9]};
    opacity: 0.96 !important;
  }
`;
