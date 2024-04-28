import { DownOutlined } from "@ant-design/icons";
import { t } from "@lingui/macro";
import isMarkActive from "@ikigai/editor/dist/queries/isMarkActive";
import getMarkRange from "@ikigai/editor/dist/queries/getMarkRange";
import { ExtensionName } from "@ikigai/editor/dist/types/extensions.enum";
import { textColor } from "@ikigai/editor/dist/util/mappingColor";
import { ColorPicker, Tooltip } from "antd";
import useEditorActionStore from "context/ZustandEditorAction";
import React, { useState } from "react";
import styled from "styled-components";
import shallow from "zustand/shallow";
import type { Color } from "antd/es/color-picker";

const colorPallet: string[] = Object.keys(textColor).map((c) => textColor[c]);

const DEFAULT_COLOR = "#181E2D";

export const TextColorPicker = () => {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [isOpen, setIsOpen] = useState(false);

  const {
    mapEditorAction,
    activeDocumentEditorId,
    currentPointingDocumentId,
    currentPointingEditorState,
  } = useEditorActionStore(
    ({
      mapEditorAction,
      activeDocumentEditorId,
      currentPointingDocumentId,
      currentPointingEditorState,
    }) => ({
      mapEditorAction,
      activeDocumentEditorId,
      currentPointingDocumentId,
      currentPointingEditorState,
    }),
    shallow,
  );

  const currentEditorAction = mapEditorAction.get(activeDocumentEditorId);
  const editorView = currentEditorAction?.editorView;
  const editorState = currentEditorAction?.editorState;
  const commands = currentEditorAction?.commands;

  const getCurrentActiveColor = () => {
    const targetEditorState =
      activeDocumentEditorId === currentPointingDocumentId
        ? currentPointingEditorState
        : editorState;
    const spec = targetEditorState?.schema.marks[ExtensionName.TextColor];
    const isActive = isMarkActive(spec)(targetEditorState);

    if (isActive) {
      const textColorMarkInRange = getMarkRange(
        targetEditorState.selection.$from,
        spec,
      );
      if (textColorMarkInRange) {
        const currentColor: string = textColorMarkInRange.mark.attrs.color;
        return currentColor;
      }
    }

    return selectedColor;
  };

  const handleColorChange = (color: string) => {
    const command = commands[ExtensionName.TextColor];
    command({ color }, editorView);
    setSelectedColor(color);
  };

  const handleColorPicker = (color: Color, hex: string) => {
    const castingColor =
      typeof color === "string" ? color : color.toHexString();
    handleColorChange(castingColor);
  };

  return (
    <ColorPickerContainer>
      {colorPallet.map((c) => {
        return (
          <ColorPickerBtn
            onClick={() => handleColorChange(c)}
            key={c}
            color={c}
            isSelected={c === getCurrentActiveColor()}
          >
            <div />
          </ColorPickerBtn>
        );
      })}
      <ColorPicker
        value={selectedColor}
        onChange={handleColorPicker}
        destroyTooltipOnHide
        onOpenChange={setIsOpen}
      >
        <Tooltip destroyTooltipOnHide title={t`More colors`} arrow={false}>
          <MoreColorBtn>
            <InlineIcon>
              <DownOutlined
                style={{ rotate: isOpen ? `${180}deg` : "unset" }}
              />
            </InlineIcon>
          </MoreColorBtn>
        </Tooltip>
      </ColorPicker>
    </ColorPickerContainer>
  );
};

const ColorPickerContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 12px;
  column-gap: 14px;
  margin-top: 12px;
`;

const ColorPickerBtn = styled.div<{ color?: string; isSelected?: boolean }>`
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 100%;
  border: ${({ color, isSelected }) =>
    `2px solid ${isSelected ? color : "transparent"}`};

  div:first-child {
    margin: ${({ isSelected }) => (isSelected ? "0 auto" : "unset")};
    margin-top: ${({ isSelected }) => (isSelected ? "2px" : "unset")};
    border-radius: 100%;
    width: 28px;
    height: 28px;
    background-color: ${({ color }) => color};
  }
`;

const MoreColorBtn = styled.div`
  cursor: pointer;
  width: 34px;
  height: 34px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: linear-gradient(
      180deg,
      #ff0000 0%,
      #ff9900 18.23%,
      #dbff00 30.73%,
      #00ff29 45.31%,
      #00fff0 57.29%,
      #0038ff 72.92%,
      #8f00ff 82.81%,
      #ff008a 94.27%,
      #ff0000 100%
    );
    -webkit-mask: radial-gradient(
      farthest-side,
      transparent calc(100% - 2px),
      #fff 0
    );
  }
`;

const InlineIcon = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  margin-top: 3px;
  margin-left: 3px;
  background-color: ${({ color, theme }) => color || theme.colors.gray[5]};
`;
