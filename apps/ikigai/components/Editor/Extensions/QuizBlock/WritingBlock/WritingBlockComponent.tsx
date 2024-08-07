import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { t } from "@lingui/macro";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { TextAlign } from "@tiptap/extension-text-align";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { JSONContent } from "@tiptap/react";
import { NodeViewProps } from "@tiptap/core";
import React from "react";
import CharacterCount from "@tiptap/extension-character-count";
import { Text } from "@radix-ui/themes";

import BaseEditor, { useIkigaiEditor } from "components/Editor/BaseEditor";
import { isEmptyUuid } from "util/FileUtil";
import { DocumentActionPermission, QuizType } from "graphql/types";
import usePermission from "hook/UsePermission";
import QuizBlockWrapper from "../QuizBlockWrapper";
import { useWritingQuiz } from "hook/UseQuiz";

const WritingBlockComponent = (props: NodeViewProps) => {
  const allow = usePermission();
  const pageContentId = props.extension.options.pageContentId;
  const quizId = props.node.attrs.quizId;
  const { questionData, debounceUpsertQuiz, cancelDebounceUpsertQuiz } =
    useWritingQuiz(quizId, pageContentId);

  const updateContent = (content: JSONContent) => {
    if (isEmptyUuid(quizId)) return;
    debounceUpsertQuiz({ content }, {});
  };

  const forceSave = (content: JSONContent) => {
    if (isEmptyUuid(quizId)) return;
    cancelDebounceUpsertQuiz();
    debounceUpsertQuiz({ content }, {});
  };

  const editor = useIkigaiEditor({
    body: questionData.content,
    onUpdate: updateContent,
    onForceSave: forceSave,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: t`Writing here...`,
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
      CharacterCount,
    ],
    readOnly: !allow(DocumentActionPermission.INTERACTIVE_WITH_TOOL),
  });

  return (
    <QuizBlockWrapper
      quizType={QuizType.WRITING_BLOCK}
      nodeViewProps={props}
      showSetting={false}
    >
      <div style={{ minHeight: 200 }}>
        <BaseEditor editor={editor} />
      </div>
      <div style={{ paddingRight: 5 }}>
        <Text size="2" align="right" as="div" color={"gray"}>
          {editor?.storage?.characterCount?.characters() || 0} characters
          /&nbsp;
          {editor?.storage?.characterCount?.words() || 0} words
        </Text>
      </div>
    </QuizBlockWrapper>
  );
};

export default WritingBlockComponent;
