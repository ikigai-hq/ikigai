import { Menu as MenuAntd } from "antd";
import styled from "styled-components";

export const Menu = styled(MenuAntd)`
  &&& {
    box-shadow: 0px 0px 20px rgba(19, 48, 122, 0.1);
    border-radius: 4px;
    background: ${(props) => props.theme.colors.gray[0]});
    min-width: 180px;
    padding: 4px 0;
  }
`;

export const MenuItem = styled(MenuAntd.Item)`
  &&& {
    height: 32px;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    color: ${(props) => props.theme.colors.gray[8]});
    display: flex;
    align-items: center;
    margin: 0;
    padding: 5px 12px;

    span {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
  }

  &:hover {
    background: ${(props) => props.theme.colors.gray[1]});
  }
`;
