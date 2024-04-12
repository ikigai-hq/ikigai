import styled from "styled-components";
import { Space } from "antd";
import { DragCursor } from "../DragCursor";

export const FileHeaderContainer = styled.div`
  position: absolute;
  z-index: 2;
  display: flex;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 3px;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 300ms ease-in 0s;

  button {
    border-radius: 0px !important;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
  }

  svg {
    font-size: 14px;
    color: #fff;
  }
`;

export const BlockContainer = styled.div<{
  $isSelected: boolean;
  $defaultBg?: string;
}>`
  background: ${(props) =>
    props.$isSelected
      ? props.theme.colors.selection1
      : props.$defaultBg || "#F5F6F9;"};
  border-radius: 6px;
  height: 100%;
  margin: 8px 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;

  &:hover {
    ${DragCursor} {
      display: inline-block;
    }

    ${FileHeaderContainer} {
      opacity: 1;
    }
  }
`;

export const BlockHeaderContainer = styled.div`
  width: 100%;
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  font-weight: 400;
  padding: 0 10px;
  font-size: 16px;
  box-sizing: border-box;
`;

export const BlockBodyContainer = styled.div`
  padding: 10px;
`;

export const DropdownItemContainer = styled(Space)`
  display: flex;
  margin: 0 -4px;

  svg {
    font-size: 14px;
  }
`;
