import * as React from "react";
import { Button, Dropdown, Space, Tooltip } from "antd";
import { EditorView } from "prosemirror-view";
import styled, { withTheme } from "styled-components";
import ToolbarSeparator from "./ToolbarSeparator";
import theme from "../styles/theme";
import { HighlightType, MenuItem } from "../types";
import {
  backgroundTextColorBlockMenu,
  textColorBlockMenu,
} from "../menus/textColorBlockMenu";
import { ExtensionName } from "../types/extensions.enum";
import { TextSelection } from "prosemirror-state";
import { TextColorIcon } from "../menus/icons";

type Props = {
  tooltip: typeof React.Component | React.FC<any>;
  commands: Record<string, any>;
  view: EditorView;
  theme: typeof theme;
  items: MenuItem[];
  addHighlight?: (type: HighlightType, originalText?: string) => void;
};

type State = {
  isOpenTextColorPallet: boolean;
};

type CurrentNodeColor = {
  color: string | null;
  bg: string | null;
};

const defaultNodeColor: CurrentNodeColor = {
  color: "#525151",
  bg: null,
};
const PLACEHOLDER_TEXT = "[typing to replace]";

const getCurrentTextNodeAt = (view: EditorView): CurrentNodeColor | null => {
  const { state } = view;
  const prosemirrorNodeAt = state.doc.nodeAt(state.selection.from);
  if (!prosemirrorNodeAt) return null;

  const marks = prosemirrorNodeAt.marks;
  const colorTextMark = marks.find((m) => m.type.name === "colorText");

  if (colorTextMark) {
    return colorTextMark.attrs as CurrentNodeColor;
  }

  return defaultNodeColor;
};

const ColorItem: React.FC<{ nodeColor: CurrentNodeColor | null }> = ({
  nodeColor,
}) => {
  return (
    <ColorItemContainer>
      <TextColor $nodeColor={nodeColor ? nodeColor : null}>A</TextColor>
    </ColorItemContainer>
  );
};

class ToolbarMenu extends React.Component<Props, State> {
  render() {
    const { view, items } = this.props;
    const { state } = view;
    const colorPallet = textColorBlockMenu("colorText");
    const backgroundPallet = backgroundTextColorBlockMenu("colorText");
    const currentSelectionColor = getCurrentTextNodeAt(view);

    return (
      <Space.Compact block>
        {items.map((item, index) => {
          if (item.name === "separator" && item.visible !== false) {
            return <ToolbarSeparator key={index} />;
          }
          if (item.visible === false) {
            return null;
          }
          const isActive = item.active ? item.active(state) : false;
          const handleOnClick = (m: MenuItem) => {
            this.setState({ isOpenTextColorPallet: false });
            if (m.name === ExtensionName.Annotation) {
              this.props.commands[ExtensionName.Annotation]({ ...m.attrs });
              if (m.attrs?.type === "replace") {
                // get size of selected text.
                const selectedTextSize =
                  view.state.tr.selection.to - view.state.tr.selection.from;
                // adding white-space after selected text.
                const replacedSelection = view.state.tr.insertText(
                  " ",
                  view.state.selection.to
                );
                // dispatch transaction to set new selection.
                view.dispatch(replacedSelection);
                const { from } = replacedSelection.selection;
                const $from = view.state.doc.resolve(
                  from - selectedTextSize > 1 ? from - selectedTextSize - 1 : 0
                );
                const $to = view.state.doc.resolve(from > 1 ? from - 1 : 0);
                const selectedContent = view.state.doc.cut($from.pos, $to.pos);
                const newTextSelection = view.state.tr.setSelection(
                  new TextSelection($from, $to)
                );
                // set new text selection.
                view.dispatch(newTextSelection);
                // add strikethrough to selected text.
                const addingStrikethroughMark = view.state.tr.addMark(
                  view.state.selection.from,
                  view.state.selection.to,
                  view.state.schema.marks.strikethrough.create()
                );
                view.dispatch(addingStrikethroughMark);
                const placeholderText = view.state.tr.insertText(
                  PLACEHOLDER_TEXT,
                  addingStrikethroughMark.selection.to + 1
                );
                view.dispatch(placeholderText);
                view.dispatch(
                  view.state.tr.setSelection(
                    new TextSelection(
                      view.state.doc.resolve(placeholderText.selection.from),
                      view.state.doc.resolve(
                        placeholderText.selection.to +
                          PLACEHOLDER_TEXT.length +
                          1
                      )
                    )
                  )
                );
                this.props.addHighlight &&
                  this.props.addHighlight(
                    HighlightType.REPLACE,
                    selectedContent ? selectedContent.textContent : undefined
                  );
              } else {
                this.props.addHighlight &&
                  this.props.addHighlight(HighlightType.NORMAL, "");
              }
            } else {
              m.name && this.props.commands[m.name]({ ...m.attrs });
            }
          };

          return (
            <div key={index}>
              {item.name === "colorText" ? (
                <Tooltip
                  arrow={false}
                  title={
                    <LabelTooltip>
                      <div>{item.tooltip}</div>
                      <div>{item.shortcut}</div>
                    </LabelTooltip>
                  }
                >
                  <Dropdown
                    trigger={["click"]}
                    onOpenChange={(open) => {
                      const activeEditor =
                        document.getElementById("active-editor");
                      if (activeEditor) {
                        open
                          ? (activeEditor.style.overflow = "hidden")
                          : (activeEditor.style.overflow = "auto");
                      }
                    }}
                    menu={{
                      items: [...colorPallet, ...backgroundPallet].map((m) => {
                        return {
                          key: m.title || "",
                          label: (
                            <Flex
                              key={m.title}
                              onClick={() =>
                                handleOnClick({
                                  ...m,
                                  attrs: {
                                    ...currentSelectionColor,
                                    ...m.attrs,
                                  },
                                })
                              }
                            >
                              <ColorItem
                                nodeColor={{
                                  color: m.textColor ? m.textColor : null,
                                  bg: m.bgColor ? m.bgColor : null,
                                }}
                              />
                              <div>{m.title}</div>
                            </Flex>
                          ),
                        };
                      }),
                    }}
                    dropdownRender={(menus) => {
                      return <DropdownMenu>{menus}</DropdownMenu>;
                    }}
                  >
                    <FloatingToolbarButton
                      $active={isActive}
                      type="text"
                      icon={
                        <TextColorIcon color={currentSelectionColor?.color} />
                      }
                    />
                  </Dropdown>
                </Tooltip>
              ) : (
                <Tooltip
                  arrow={false}
                  title={
                    <LabelTooltip>
                      <div>{item.tooltip}</div>
                      <div>{item.shortcut}</div>
                    </LabelTooltip>
                  }
                >
                  <FloatingToolbarButton
                    $active={isActive}
                    onClick={() => handleOnClick(item)}
                    icon={item.icon}
                    type="text"
                  />
                </Tooltip>
              )}
            </div>
          );
        })}
      </Space.Compact>
    );
  }
}

const LabelTooltip = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FloatingToolbarButton = styled(Button)<{ $active: boolean }>`
  border-top: transparent;
  border-bottom: transparent;
  background: ${({ $active }) => ($active ? "#F4F5F7" : "")};
`;

const DropdownMenu = styled.div`
  height: 400px;
  overflow: auto;
  border-radius: 4;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

const TextColor = styled.div<{ $nodeColor: CurrentNodeColor | null }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  text-align: center;
  font-size: 16px;
  border-radius: 4px;
  font-weight: 500;
  box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px inset;
  color: ${({ $nodeColor }) => ($nodeColor ? $nodeColor.color : "inherit")};
  background: ${({ $nodeColor }) => ($nodeColor ? $nodeColor.bg : "inherit")};
`;

const ColorItemContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 4;
`;

export default withTheme(ToolbarMenu as any);
