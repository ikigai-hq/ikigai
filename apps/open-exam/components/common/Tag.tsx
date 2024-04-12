import React from "react";

import { Tag as TagAntd, TagProps } from "antd";
import styled from "styled-components";
import {
  red,
  orange,
  gold, 
  green, 
  blue,
  gray
} from '@ant-design/colors';

export type TagColor =
  | "polarGreen"
  | "dayBreakBlue"
  | "dustRed"
  | "calendulaGold"
  | "defaultGray"
  | "sunsetOrange"
  | "magenta";

const mappingHexColor: { [key in TagColor]: string } = {
  polarGreen: green.primary,
  dayBreakBlue: blue.primary,
  dustRed: red.primary,
  defaultGray: gray[8],
  calendulaGold: gold.primary,
  sunsetOrange: orange.primary,
  magenta: orange.primary,
};

const mappingBgHexColor: { [key in TagColor]: string } = {
  polarGreen: green[0],
  dayBreakBlue: blue[0],
  dustRed: red[0],
  defaultGray: gray[1],
  calendulaGold: gold[0],
  sunsetOrange: orange[0],
  magenta: orange[0],
};

const TagContainer = styled(TagAntd)<{ color: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 2px;
  height: 22px;
  width: max-content;
  color: ${({ color }) => mappingHexColor[color]} !important;
  background-color: ${({ color }) => mappingBgHexColor[color]};
  border: ${({ color }) => `1px solid ${mappingHexColor[color]}`} !important;
`;

interface Props extends TagProps {
  children: React.ReactNode;
  color?: TagColor;
}

const Tag = ({ children, color }: Props) => (
  <TagContainer color={color}>{children}</TagContainer>
);

export default Tag;
