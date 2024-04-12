import { Drawer as DrawerAntd } from "antd";
import styled from "styled-components";

import { Text, TextWeight } from "./Text";

export const CloseDrawer = styled.div`
  text-align: right;

  svg {
    color: ${(props) => props.theme.colors.gray[8]};
    font-size: 16px;
  }
`;

export const HeaderDrawer = styled.div`
  display: flex;
  align-items: center;
  margin: 28px 0 28px 0;
`;

export const TitleDrawer = styled(Text)`
  flex: 1;
  display: block;
  font-size: 24px;
  color: ${(props) => props.theme.colors.gray[8]};
  font-weight: ${TextWeight.bold};
`;

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

export const CommonClassManagementDrawer = styled(Drawer)<{ width: string }>`
  .ant-drawer-content-wrapper {
    width: ${(props) => props.width} !important;
    max-width: 1007px;
    border-radius: 12px 0 0 12px;
    overflow: hidden;
  }
`;
