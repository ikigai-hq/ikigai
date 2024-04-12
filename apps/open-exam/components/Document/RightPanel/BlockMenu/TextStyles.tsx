import React from "react";
import { InsertBlocksContainer } from "./InsertBlocks";
import { Text, TextWeight } from "components/common/Text";
import { Trans, t } from "@lingui/macro";
import {
  IMappingBlockGroupItemValue,
  defaultInlineTextMenu,
  mappingTextGroup,
} from "./defaultMenu.config";
import styled from "styled-components";
import { Button, Col, Divider, Row, Tooltip } from "antd";
import { TextColorPicker } from "./TextColorPicker";
import useEditorActionStore from "context/ZustandEditorAction";
import shallow from "zustand/shallow";
import isMarkActive from "@zkls/editor/dist/queries/isMarkActive";
import isNodeActive from "@zkls/editor/dist/queries/isNodeActive";
import { ButtonWithTooltip } from "components/common/Button";
import { lift } from "prosemirror-commands";

export const TextStyles: React.FC = () => {
  const {
    mapEditorAction,
    activeDocumentEditorId,
    currentPointingEditorState,
    currentPointingDocumentId,
  } = useEditorActionStore(
    ({
      mapEditorAction,
      activeDocumentEditorId,
      currentPointingEditorState,
      currentPointingDocumentId,
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

  const checkIsActive = (
    schemaType: "nodes" | "marks",
    extensionName: string,
    attrs?: Record<string, any>,
  ) => {
    const targetEditorState =
      activeDocumentEditorId === currentPointingDocumentId
        ? currentPointingEditorState
        : editorState;
    const spec = targetEditorState?.schema[schemaType][extensionName];
    if (schemaType === "marks") {
      return isMarkActive(spec)(targetEditorState);
    }
    return isNodeActive(spec, attrs)(targetEditorState);
  };

  const handleTriggerTextStyle = (value: IMappingBlockGroupItemValue) => {
    const targetEditorState =
      activeDocumentEditorId === currentPointingDocumentId
        ? currentPointingEditorState
        : editorState;
    const command = commands[value.extensionName];
    value?.schemaType === "nodes" &&
      lift(targetEditorState, editorView.dispatch);
    command(value?.attrs);
  };

  return (
    <InsertBlocksContainer>
      <div style={{ padding: "0 16px" }}>
        <Text level={2} weight={TextWeight.mediumlv2}>
          {t`Styles`}
        </Text>
        <Row gutter={[8, 8]} style={{ marginTop: 12 }}>
          {Object.keys(mappingTextGroup).map((text) => {
            const item: IMappingBlockGroupItemValue = mappingTextGroup[text];
            return (
              <Col key={text} span={12}>
                <Tooltip
                  title={<Trans>{item.description}</Trans>}
                  arrow={false}
                >
                  <TextStyleBtn
                    onClick={() => handleTriggerTextStyle(item)}
                    $selected={checkIsActive(
                      item.schemaType,
                      item.extensionName,
                      item.attrs,
                    )}
                  >
                    {item.component}
                  </TextStyleBtn>
                </Tooltip>
              </Col>
            );
          })}
        </Row>
        <StyledDivider />
        <Text level={2} weight={TextWeight.mediumlv2}>
          {t`Text`}
        </Text>
        <InlineTextStyle>
          {Object.keys(defaultInlineTextMenu).map((m) => {
            const item: IMappingBlockGroupItemValue = defaultInlineTextMenu[m];
            return (
              <ButtonWithTooltip
                key={m}
                isSelected={checkIsActive(item.schemaType, item.extensionName)}
                tooltipProps={{ title: <Trans>{m}</Trans> }}
                btnProps={{
                  type: "text",
                  icon: item.icon,
                  onClick: () => handleTriggerTextStyle(item),
                  style: { padding: 0 },
                }}
              />
            );
          })}
        </InlineTextStyle>
        <StyledDivider />
        <Text level={2} weight={TextWeight.mediumlv2}>
          {t`Color`}
        </Text>
        <TextColorPicker />
      </div>
    </InsertBlocksContainer>
  );
};

const TextStyleBtn = styled(Button)<{ $selected?: boolean }>`
  display: block;
  width: 100%;
  height: 40px;
  max-width: 118px;
  border-radius: 8px;
  border: ${({ theme, $selected }) =>
    `1px solid ${$selected ? theme.colors.primary[2] : theme.colors.gray[4]}`};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary[0] : theme.colors.gray[0]};
`;

const StyledDivider = styled(Divider)`
  margin: 20px 0px;
`;

const InlineTextStyle = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;
