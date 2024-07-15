import React from "react";
import * as Toolbar from "@radix-ui/react-toolbar";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBlockquote,
  IconBold,
  IconBoxMultiple,
  IconCode,
  IconCopyCheck,
  IconFileUpload,
  IconGradienter,
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
  IconTools,
  IconUnderline,
  IconWriting,
} from "@tabler/icons-react";
import { TwitterPicker } from "react-color";
import { t, Trans } from "@lingui/macro";
import { Button, DropdownMenu, Tooltip } from "@radix-ui/themes";

import useEditorStore from "store/EditorStore";
import { WRITING_BLOCK_NAME } from "components/Editor/Extensions/QuizBlock/WritingBlock";
import { hasExtension } from "util/ExtensionUtil";
import { FILE_HANDLER_NAME } from "components/Editor/Extensions/FileHandler";
import { SINGLE_CHOICE_BLOCK_NAME } from "../../../Editor/Extensions/QuizBlock/SingleChoiceBlock";
import { MULTIPLE_CHOICE_BLOCK_NAME } from "../../../Editor/Extensions/QuizBlock/MultipleChoiceBlock";

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
    if (!activeEditor || !hasExtension(activeEditor, FILE_HANDLER_NAME)) return;
    activeEditor.chain().focus().insertFileHandler().run();
  };

  const onInsertWritingBlock = () => {
    if (!activeEditor || !hasExtension(activeEditor, WRITING_BLOCK_NAME))
      return;
    activeEditor.chain().focus().insertWritingBlock().run();
  };

  const onInsertSingleChoice = () => {
    if (!activeEditor || !hasExtension(activeEditor, SINGLE_CHOICE_BLOCK_NAME))
      return;
    activeEditor.chain().focus().insertSingleChoice().run();
  };

  const onInsertMultipleChoice = () => {
    if (
      !activeEditor ||
      !hasExtension(activeEditor, MULTIPLE_CHOICE_BLOCK_NAME)
    )
      return;
    activeEditor.chain().focus().insertMultipleChoice().run();
  };

  return (
    <div style={{ height: "45px", marginLeft: "-5px" }}>
      <Toolbar.Root className="ToolbarRoot" aria-label="Formatting options">
        <Toolbar.ToggleGroup type="multiple" aria-label="Text formatting">
          <Tooltip content={t`Bold`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="bold"
              aria-label="Bold"
              data-state={toolbarOptions?.bold ? "on" : "off"}
              onClick={onToggleBold}
            >
              <IconBold size={20} stroke={2.5} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <Tooltip content={t`Italic`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="italic"
              aria-label="Italic"
              data-state={toolbarOptions?.italic ? "on" : "off"}
              onClick={onToggleItalic}
            >
              <IconItalic size={20} stroke={1.7} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <Tooltip content={t`Underline`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="underline"
              aria-label="Underline"
              data-state={toolbarOptions?.underline ? "on" : "off"}
              onClick={onToggleUnderline}
            >
              <IconUnderline size={20} stroke={1.7} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <Tooltip content={t`Strike through`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="strikethrough"
              aria-label="Strike through"
              data-state={toolbarOptions?.strike ? "on" : "off"}
              onClick={onToggleStrike}
            >
              <IconStrikethrough size={20} stroke={1.7} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <Tooltip content={t`Code`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="code"
              aria-label="Code"
              data-state={toolbarOptions?.code ? "on" : "off"}
              onClick={onToggleCode}
            >
              <IconCode size={20} stroke={1.7} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <DropdownMenu.Root>
            <Tooltip content={t`Text color`}>
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
            </Tooltip>
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
            <Tooltip content={t`Highlight text`}>
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
            </Tooltip>
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
          <Tooltip content={t`Heading 1`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="1"
              aria-label="heading 1"
              onClick={() => onChangeHeading(1)}
            >
              <IconH1 size={20} stroke={2} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <Tooltip content={t`Heading 2`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="2"
              aria-label="heading 2"
              onClick={() => onChangeHeading(2)}
            >
              <IconH2 size={20} stroke={2} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <Tooltip content={t`Heading 3`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="3"
              aria-label="heading 3"
              onClick={() => onChangeHeading(3)}
            >
              <IconH3 size={20} stroke={2} />
            </Toolbar.ToggleItem>
          </Tooltip>
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
          <Tooltip content={t`Bullet list`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="bulletList"
              aria-label="Bullet List"
              onClick={onChangeBulletList}
            >
              <IconList size={20} stroke={2} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <Tooltip content={t`Number list`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="orderedList"
              aria-label="Ordered List"
              onClick={onChangeOrderedList}
            >
              <IconListNumbers size={20} stroke={2} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <Tooltip content={t`Todo list`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="todoList"
              aria-label="Todo List"
              onClick={onChangeTaskList}
            >
              <IconListCheck size={20} stroke={2} />
            </Toolbar.ToggleItem>
          </Tooltip>
        </Toolbar.ToggleGroup>
        <Toolbar.Separator className="ToolbarSeparator" />
        <Toolbar.ToggleGroup
          value={toolbarOptions?.textAlign}
          type="single"
          aria-label="Text alignment"
        >
          <Tooltip content={t`Left`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="left"
              aria-label="Left aligned"
              onClick={() => onChangeTextAlign("left")}
            >
              <IconAlignLeft size={20} stroke={1.7} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <Tooltip content={t`Center`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="center"
              aria-label="Center aligned"
              onClick={() => onChangeTextAlign("center")}
            >
              <IconAlignCenter size={20} stroke={1.7} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <Tooltip content={t`Right`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="right"
              aria-label="Right aligned"
              onClick={() => onChangeTextAlign("right")}
            >
              <IconAlignRight size={20} stroke={1.7} />
            </Toolbar.ToggleItem>
          </Tooltip>
        </Toolbar.ToggleGroup>
        <Toolbar.Separator className="ToolbarSeparator" />
        <Toolbar.ToggleGroup type="multiple" aria-label="Quiz Blocks">
          <Tooltip content={t`Writing Quiz`}>
            <Toolbar.ToolbarButton
              className="ToolbarToggleItem"
              value="writingBlock"
              aria-label="Writing Block"
              disabled={
                activeEditor?.isActive(WRITING_BLOCK_NAME) ||
                !hasExtension(activeEditor, WRITING_BLOCK_NAME)
              }
              onClick={onInsertWritingBlock}
            >
              <IconWriting size={20} stroke={2} />
            </Toolbar.ToolbarButton>
          </Tooltip>
          <Tooltip content={t`Single Choice Quiz`}>
            <Toolbar.ToolbarButton
              className="ToolbarToggleItem"
              value="singleChoice"
              aria-label="Single Choice"
              disabled={
                activeEditor?.isActive(SINGLE_CHOICE_BLOCK_NAME) ||
                !hasExtension(activeEditor, SINGLE_CHOICE_BLOCK_NAME)
              }
              onClick={onInsertSingleChoice}
            >
              <IconGradienter size={20} stroke={2} />
            </Toolbar.ToolbarButton>
          </Tooltip>
          <Tooltip content={t`Multiple Choice Quiz`}>
            <Toolbar.ToolbarButton
              className="ToolbarToggleItem"
              value="multipleChoice"
              aria-label="Multiple Choice"
              disabled={
                activeEditor?.isActive(MULTIPLE_CHOICE_BLOCK_NAME) ||
                !hasExtension(activeEditor, MULTIPLE_CHOICE_BLOCK_NAME)
              }
              onClick={onInsertMultipleChoice}
            >
              <IconCopyCheck size={20} stroke={2} />
            </Toolbar.ToolbarButton>
          </Tooltip>
        </Toolbar.ToggleGroup>
        <Toolbar.Separator className="ToolbarSeparator" />
        <Toolbar.ToggleGroup type="multiple" aria-label="Other Blocks">
          <Tooltip content={t`Quote`}>
            <Toolbar.ToggleItem
              className="ToolbarToggleItem"
              value="blockquote"
              aria-label="Block Quote"
              data-state={toolbarOptions?.blockquote ? "on" : "off"}
              onClick={onChangeBlockquote}
            >
              <IconBlockquote size={20} stroke={2} />
            </Toolbar.ToggleItem>
          </Tooltip>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Toolbar.ToolbarButton
                className="ToolbarToggleItem"
                value="insert-item"
                aria-label="InsertItem"
              >
                <IconTools size={20} stroke={1.7} /> <Trans>More Tools</Trans>
              </Toolbar.ToolbarButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content style={{ padding: 5 }}>
              <DropdownMenu.Item
                onClick={onInsertFileHandler}
                disabled={!hasExtension(activeEditor, FILE_HANDLER_NAME)}
              >
                <IconFileUpload size={20} stroke={1.7} />{" "}
                <Trans>File Upload</Trans>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Toolbar.ToggleGroup>
      </Toolbar.Root>
    </div>
  );
};

export default ContentToolbar;
