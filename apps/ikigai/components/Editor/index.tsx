import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { TextAlign } from "@tiptap/extension-text-align";
import { BulletList } from "@tiptap/extension-bullet-list";
import { ListItem } from "@tiptap/extension-list-item";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { t } from "@lingui/macro";
import { useDebounceFn } from "ahooks";
import { useEffect } from "react";

import { IPageContent } from "store/PageContentStore";
import useAddOrUpdatePageContent from "hook/UseUpsertPageContent";
import FileHandler from "./Extensions/FileHandler";
import WritingBlock from "./Extensions/QuizBlock/WritingBlock";
import BaseEditor, { useIkigaiEditor } from "./BaseEditor";
import SingleChoiceBlock from "./Extensions/QuizBlock/SingleChoiceBlock";
import MultipleChoiceBlock from "./Extensions/QuizBlock/MultipleChoiceBlock";
import SelectOptionComponent from "./Extensions/QuizBlock/SelectOptionBlock";
import FillInBlank from "./Extensions/QuizBlock/FillInBlankBlock";
import useEditorStore from "store/EditorStore";

export type EditorProps = {
  readOnly: boolean;
  pageContent: IPageContent;
};

const Editor = ({ pageContent, readOnly }: EditorProps) => {
  const addEditor = useEditorStore((state) => state.addEditor);
  const { upsert } = useAddOrUpdatePageContent(
    pageContent.id,
    pageContent.pageId,
  );
  const { run, cancel } = useDebounceFn(upsert, { wait: 300, maxWait: 1000 });

  const onPaste = (event: ClipboardEvent) => {
    const pageContentEditor = useEditorStore.getState().editors[pageContent.id];
    if (
      pageContentEditor &&
      pageContentEditor.isFocused &&
      event.clipboardData.files.length > 0
    ) {
      for (const file of event.clipboardData.files) {
        pageContentEditor.commands.insertFileHandler(file);
      }
      return true;
    }
    return false;
  };

  const onDrop = (event: DragEvent) => {
    const pageContentEditor = useEditorStore.getState().editors[pageContent.id];
    if (pageContentEditor && event.dataTransfer.files.length > 0) {
      for (const file of event.dataTransfer.files) {
        pageContentEditor.commands.insertFileHandler(file);
      }
      return true;
    }
    return false;
  };

  const editor = useIkigaiEditor({
    attributes: {
      pageContentId: pageContent.id,
    },
    body: pageContent.body,
    onUpdate: (body) => run({ body }),
    onForceSave: (body) => {
      cancel();
      upsert({ body });
    },
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: t`Typing content here...`,
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      BulletList.configure({
        keepAttributes: true,
        keepMarks: true,
      }),
      OrderedList.configure({
        keepAttributes: true,
        keepMarks: true,
      }),
      ListItem,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      FileHandler.configure({
        pageContentId: pageContent.id,
      }),
      WritingBlock.configure({
        pageContentId: pageContent.id,
      }),
      SingleChoiceBlock.configure({
        pageContentId: pageContent.id,
      }),
      MultipleChoiceBlock.configure({
        pageContentId: pageContent.id,
      }),
      SelectOptionComponent.configure({
        pageContentId: pageContent.id,
      }),
      FillInBlank.configure({
        pageContentId: pageContent.id,
      }),
    ],
    readOnly,
    onPaste,
    onDrop,
  });

  useEffect(() => {
    addEditor(pageContent.id, editor);
  }, [editor]);

  return <BaseEditor editor={editor} />;
};

export default Editor;
