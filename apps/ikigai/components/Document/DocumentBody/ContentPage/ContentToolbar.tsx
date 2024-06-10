import React from "react";
import * as Toolbar from "@radix-ui/react-toolbar";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconCode,
  IconHighlight,
  IconItalic,
  IconStrikethrough,
  IconTextColor,
  IconUnderline,
} from "@tabler/icons-react";

import useEditorStore from "store/EditorStore";
import { Button, DropdownMenu } from "@radix-ui/themes";
import { TwitterPicker } from "react-color";

const ContentToolbar = () => {
  const activeEditor = useEditorStore((state) => state.activeEditor);
  const toolbarOptions = useEditorStore((state) => state.toolbarOptions);
  const setToolbarOptions = useEditorStore((state) => state.setToolbarOptions);

  const onToggleBold = () => {
    if (!activeEditor) return;
    activeEditor.chain().focus().toggleBold().run();
    setToolbarOptions({ bold: activeEditor.isActive("bold") });
  };

  const onToggleItalic = () => {
    if (!activeEditor) return;
    activeEditor.chain().focus().toggleItalic().run();
    setToolbarOptions({ italic: activeEditor.isActive("italic") });
  };

  const onToggleUnderline = () => {
    if (!activeEditor) return;
    activeEditor.chain().focus().toggleUnderline().run();
    setToolbarOptions({ underline: activeEditor.isActive("underline") });
  };

  const onToggleStrike = () => {
    if (!activeEditor) return;
    activeEditor.chain().focus().toggleStrike().run();
    setToolbarOptions({ strike: activeEditor.isActive("strike") });
  };

  const onToggleCode = () => {
    if (!activeEditor) return;
    activeEditor.chain().focus().toggleCode().run();
    setToolbarOptions({ code: activeEditor.isActive("code") });
  };

  const onChangeTextColor = (color?: string) => {
    if (!activeEditor) return;
    if (color) {
      activeEditor.chain().focus().setColor(color).run();
      setToolbarOptions({ color });
    } else {
      activeEditor.chain().focus().unsetColor().run();
      setToolbarOptions({ color: undefined });
    }
  };

  const onChangeHighlight = (color?: string) => {
    if (!activeEditor) return;
    if (color) {
      activeEditor.chain().focus().setHighlight({ color }).run();
      setToolbarOptions({ highlightColor: color });
    } else {
      activeEditor.chain().focus().unsetHighlight().run();
      setToolbarOptions({ highlightColor: undefined });
    }
  };

  return (
    <>
      <Toolbar.Root className="ToolbarRoot" aria-label="Formatting options">
        <Toolbar.ToggleGroup type="multiple" aria-label="Text formatting">
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="bold"
            aria-label="Bold"
            data-state={toolbarOptions?.bold ? "on" : "off"}
            onClick={onToggleBold}
          >
            <IconBold size={20} stroke={2} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="italic"
            aria-label="Italic"
            data-state={toolbarOptions?.italic ? "on" : "off"}
            onClick={onToggleItalic}
          >
            <IconItalic size={20} stroke={1.7} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="underline"
            aria-label="Underline"
            data-state={toolbarOptions?.underline ? "on" : "off"}
            onClick={onToggleUnderline}
          >
            <IconUnderline size={20} stroke={1.7} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="strikethrough"
            aria-label="Strike through"
            data-state={toolbarOptions?.strike ? "on" : "off"}
            onClick={onToggleStrike}
          >
            <IconStrikethrough size={20} stroke={1.7} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="strikethrough"
            aria-label="Strike through"
            data-state={toolbarOptions?.code ? "on" : "off"}
            onClick={onToggleCode}
          >
            <IconCode size={20} stroke={1.7} />
          </Toolbar.ToggleItem>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Toolbar.ToggleItem
                className="ToolbarToggleItem"
                value="text-color"
                aria-label="Text Color"
              >
                <IconTextColor
                  size={20}
                  stroke={1.7}
                  color={toolbarOptions?.color}
                />
              </Toolbar.ToggleItem>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <div>
                <div style={{ paddingTop: 5, paddingLeft: 15 }}>
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => onChangeTextColor(undefined)}
                  >
                    Clear
                  </Button>
                </div>
                <TwitterPicker
                  triangle="hide"
                  onChange={(e) => onChangeTextColor(e.hex)}
                  colors={[
                    "#202020",
                    "#FFDC00",
                    "#FFBA18",
                    "#DC3E42",
                    "#CF3897",
                    "#3358D4",
                    "#80838D",
                    "#DD4425",
                    "#8347B9",
                    "#2B9A66",
                  ]}
                />
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Toolbar.ToggleItem
                className="ToolbarToggleItem"
                value="highlight"
                aria-label="highlight"
              >
                <IconHighlight
                  size={20}
                  stroke={1.7}
                  color={toolbarOptions?.highlightColor}
                />
              </Toolbar.ToggleItem>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <div>
                <div style={{ paddingTop: 5, paddingLeft: 15 }}>
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => onChangeHighlight(undefined)}
                  >
                    Clear
                  </Button>
                </div>
                <TwitterPicker
                  triangle="hide"
                  onChange={(e) => onChangeHighlight(e.hex)}
                  colors={[
                    "#FFDC00",
                    "#FFBA18",
                    "#DC3E42",
                    "#CF3897",
                    "#3358D4",
                    "#80838D",
                    "#DD4425",
                    "#8347B9",
                    "#2B9A66",
                    "#F9F9F9",
                  ]}
                />
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Toolbar.ToggleGroup>
        <Toolbar.Separator className="ToolbarSeparator" />
        <Toolbar.ToggleGroup type="single" aria-label="Text alignment">
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="left"
            aria-label="Left aligned"
          >
            <IconAlignLeft size={20} stroke={1.7} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="center"
            aria-label="Center aligned"
          >
            <IconAlignCenter size={20} stroke={1.7} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="right"
            aria-label="Right aligned"
          >
            <IconAlignRight size={20} stroke={1.7} />
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar.Root>
    </>
  );
};

export default ContentToolbar;
