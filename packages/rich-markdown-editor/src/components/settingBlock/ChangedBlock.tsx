import React, { MouseEvent, useEffect, useState } from "react";
import styled from "styled-components";
import { Label, LeftCol, RightCol, ColContainer } from "../CommandMenu.v2";
import { Text } from "../common/Text";
import { GroupBlockItem, defaultMenu } from "../../menus/blockMenu.config";
import { ExtensionName } from "../../types/extensions.enum";
import { TableList } from "../common/TableList";

export const PORTAL_ID = "block-menu-portal";

const initialBlockList: GroupBlockItem[] = Object.keys(defaultMenu).map(
  (m) => defaultMenu[m]
);

export const ChangedBlock: React.FC<{ left: number; top: number }> = ({
  left,
  top,
}) => {
  const [selectedIndexParent, setSelectedIndexParent] = useState(0);
  const [selectedIndexChild, setSelectedIndexChild] = useState<number>(0);
  const [isActiveParent, setIsActiveParent] = useState(true);
  const [selectedChildrenMenu, setSelectedChildrenMenu] =
    useState<GroupBlockItem>(initialBlockList[0]);

  useEffect(() => {
    setSelectedChildrenMenu(initialBlockList[selectedIndexParent]);
  }, [selectedIndexParent]);

  return (
    <ChangedBlockContainer id={PORTAL_ID} left={left} top={top}>
      <ColContainer>
        <LeftCol>
          {initialBlockList.map((m, index) => {
            return (
              <Label
                onMouseOver={(e: MouseEvent<HTMLElement>) => {
                  e.preventDefault();
                  setSelectedIndexParent(index);
                  setSelectedIndexChild(0);
                }}
                key={m.name}
                $isActive={index === selectedIndexParent}
                $hasBackground={index === selectedIndexParent && isActiveParent}
              >
                <Text>{m.name}</Text>
              </Label>
            );
          })}
        </LeftCol>
        <RightCol>
          {selectedChildrenMenu?.children?.map((m, index) => {
            const isActive = index === selectedIndexChild && !isActiveParent;

            if (m.extensionName === ExtensionName.Table) {
              return (
                <TableList
                  key={m.name}
                  onCreateTable={(attrs) => console.log({ attrs })}
                />
              );
            }

            return (
              <Label
                onMouseOver={(e: MouseEvent<HTMLElement>) => {
                  e.preventDefault();
                  setSelectedIndexChild(index);
                  setIsActiveParent(false);
                }}
                onClick={() => console.log({ m })}
                key={m.name}
                $isActive={isActive}
                $hasBackground={isActive}
              >
                {m.icon}
                <Text>{m.name}</Text>
              </Label>
            );
          })}
        </RightCol>
      </ColContainer>
    </ChangedBlockContainer>
  );
};

const ChangedBlockContainer = styled.div<{ left?: number; top?: number }>`
  position: absolute;
  left: ${({ left }) => `${left}px`};
  top: ${({ top }) => `${top}px`};
  width: 400px;
  padding: 12px;
  border-radius: 12px;
  z-index: 9999;
  background: #ffff;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 6px 16px 0px rgba(0, 0, 0, 0.08);
`;
