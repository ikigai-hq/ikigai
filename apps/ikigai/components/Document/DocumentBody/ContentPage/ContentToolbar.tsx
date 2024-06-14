import React from "react";
import * as Toolbar from "@radix-ui/react-toolbar";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBlockquote,
  IconBold,
  IconCode,
  IconFileUpload,
  IconH1,
  IconH2,
  IconH3,
  IconHighlight,
  IconItalic,
  IconList,
  IconListCheck,
  IconListNumbers,
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

  const onChangeTextAlign = (textAlign: "left" | "center" | "right") => {
    if (!activeEditor) return;
    const currentAlign = toolbarOptions.textAlign;
    if (currentAlign === textAlign) {
      activeEditor.chain().focus().unsetTextAlign().run();
      setToolbarOptions({ textAlign: undefined });
    } else {
      activeEditor.chain().focus().setTextAlign(textAlign).run();
      setToolbarOptions({ textAlign });
    }
  };

  const onChangeHeading = (headingLevel: 1 | 2 | 3) => {
    if (!activeEditor) return;
    const currentLevel = toolbarOptions.headingLevel;
    if (headingLevel === currentLevel) {
      setToolbarOptions({ headingLevel: undefined });
    } else {
      setToolbarOptions({
        headingLevel,
      });
    }
    activeEditor.chain().focus().toggleHeading({ level: headingLevel }).run();
  };

  const onChangeBlockquote = () => {
    if (!activeEditor) return;
    activeEditor.chain().focus().toggleBlockquote().run();
    setToolbarOptions({ blockquote: activeEditor.isActive("blockquote") });
  };

  const onChangeBulletList = () => {
    if (!activeEditor) return;
    activeEditor.chain().focus().toggleBulletList().run();
    setToolbarOptions({ bulletList: activeEditor.isActive("bulletList") });
  };

  const onChangeOrderedList = () => {
    if (!activeEditor) return;
    activeEditor.chain().focus().toggleOrderedList().run();
    setToolbarOptions({ orderedList: activeEditor.isActive("orderedList") });
  };

  const onChangeTaskList = () => {
    if (!activeEditor) return;
    activeEditor.chain().focus().toggleTaskList().run();
    setToolbarOptions({ todoList: activeEditor.isActive("taskList") });
  };

  const onInsertFileHandler = () => {
    if (!activeEditor) return;
    activeEditor.chain().focus().insertFileHandler().run();
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
        <Toolbar.ToggleGroup
          type="single"
          aria-label="Heading formatting"
          value={toolbarOptions?.headingLevel?.toString() || "0"}
        >
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="1"
            aria-label="heading 1"
            onClick={() => onChangeHeading(1)}
          >
            <IconH1 size={20} stroke={2} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="2"
            aria-label="heading 2"
            onClick={() => onChangeHeading(2)}
          >
            <IconH2 size={20} stroke={2} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="3"
            aria-label="heading 3"
            onClick={() => onChangeHeading(3)}
          >
            <IconH3 size={20} stroke={2} />
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
        <Toolbar.Separator className="ToolbarSeparator" />
        <Toolbar.ToggleGroup
          type="single"
          aria-label="List"
          value={
            toolbarOptions?.bulletList
              ? "bulletList"
              : toolbarOptions?.todoList
              ? "todoList"
              : toolbarOptions?.orderedList
              ? "orderedList"
              : ""
          }
        >
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="bulletList"
            aria-label="Bullet List"
            onClick={onChangeBulletList}
          >
            <IconList size={20} stroke={2} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="orderedList"
            aria-label="Ordered List"
            onClick={onChangeOrderedList}
          >
            <IconListNumbers size={20} stroke={2} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="todoList"
            aria-label="Todo List"
            onClick={onChangeTaskList}
          >
            <IconListCheck size={20} stroke={2} />
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
        <Toolbar.Separator className="ToolbarSeparator" />
        <Toolbar.ToggleGroup
          value={toolbarOptions?.textAlign}
          type="single"
          aria-label="Text alignment"
        >
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="left"
            aria-label="Left aligned"
            onClick={() => onChangeTextAlign("left")}
          >
            <IconAlignLeft size={20} stroke={1.7} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="center"
            aria-label="Center aligned"
            onClick={() => onChangeTextAlign("center")}
          >
            <IconAlignCenter size={20} stroke={1.7} />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="right"
            aria-label="Right aligned"
            onClick={() => onChangeTextAlign("right")}
          >
            <IconAlignRight size={20} stroke={1.7} />
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
        <Toolbar.Separator className="ToolbarSeparator" />
        <Toolbar.ToggleGroup type="multiple" aria-label="Other Blocks">
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="blockquote"
            aria-label="Block Quote"
            data-state={toolbarOptions?.blockquote ? "on" : "off"}
            onClick={onChangeBlockquote}
          >
            <IconBlockquote size={20} stroke={2} />
          </Toolbar.ToggleItem>
          <Toolbar.Button
            className="ToolbarToggleItem"
            value="file-handler"
            aria-label="FileHandler"
            onClick={onInsertFileHandler}
          >
            <IconFileUpload size={20} stroke={2} />
          </Toolbar.Button>
        </Toolbar.ToggleGroup>
      </Toolbar.Root>
    </>
  );
};

export default ContentToolbar;
