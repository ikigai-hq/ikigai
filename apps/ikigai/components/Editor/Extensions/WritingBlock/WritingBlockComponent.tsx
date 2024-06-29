import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { t, Trans } from "@lingui/macro";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { TextAlign } from "@tiptap/extension-text-align";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { JSONContent, NodeViewWrapper } from "@tiptap/react";
import { NodeViewProps } from "@tiptap/core";
import React, { useEffect, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useDebounceFn } from "ahooks";
import { v4 } from "uuid";
import CharacterCount from "@tiptap/extension-character-count";

import BaseEditor, { useIkigaiEditor } from "../../BaseEditor";
import { EMPTY_UUID, isEmptyUuid } from "util/FileUtil";
import { GET_WRITING_BLOCK } from "graphql/query/DocumentQuery";
import { handleError } from "graphql/ApolloClient";
import {
  CloneWritingBlock,
  DocumentActionPermission,
  GetWritingBlock,
  UpsertWritingBlock,
} from "graphql/types";
import {
  CLONE_WRITING_BLOCK,
  UPSERT_WRITING_BLOCK,
} from "graphql/mutation/DocumentMutation";
import Loading from "components/Loading";
import usePermission from "hook/UsePermission";
import { ExtensionWrapper } from "components/base/ExtensionComponentUtil";
import { Text } from "@radix-ui/themes";

const WritingBlockComponent = (props: NodeViewProps) => {
  const pageContentId = props.extension.options.pageContentId;
  const writingBlockId = props.node.attrs.writingBlockId;
  const originalBlockId = props.node.attrs.originalBlockId;
  const [initializing, setInitializing] = useState(true);
  const innerContent = useRef<JSONContent>();

  const [upsertWritingBlock, { loading: createLoading }] =
    useMutation<UpsertWritingBlock>(UPSERT_WRITING_BLOCK, {
      onError: handleError,
    });
  const [clone, { loading: cloneLoading }] = useMutation<CloneWritingBlock>(
    CLONE_WRITING_BLOCK,
    {
      onError: handleError,
    },
  );
  const [fetchWritingBlock, { loading }] = useLazyQuery<GetWritingBlock>(
    GET_WRITING_BLOCK,
    {
      onError: handleError,
      onCompleted: (data) =>
        (innerContent.current = data.documentGetWritingBlock.content),
    },
  );
  const { run: upsertDebounced, cancel } = useDebounceFn(upsertWritingBlock, {
    wait: 300,
    maxWait: 2000,
  });

  useEffect(() => {
    initialize();
  }, [writingBlockId]);

  const initialize = async () => {
    setInitializing(true);
    if (isEmptyUuid(writingBlockId)) {
      if (isEmptyUuid(originalBlockId)) {
        await addNewWritingBlock();
      } else {
        // Handle copy
        await cloneWritingBlock();
      }
    } else if (!createLoading || !loading || !cloneLoading) {
      await fetchWritingBlock({
        variables: {
          writingBlockId,
        },
      });
    }
    setInitializing(false);
  };

  const cloneWritingBlock = async () => {
    const newId = v4();

    const { data } = await clone({
      variables: {
        writingBlockId: originalBlockId,
        newWritingBlockId: newId,
        newPageContentId: pageContentId,
      },
    });

    if (data) {
      innerContent.current = data.documentCloneWritingBlock.content;
      props.updateAttributes({
        writingBlockId: newId,
        originalBlockId: EMPTY_UUID,
      });
    }
  };

  const addNewWritingBlock = async () => {
    const newId = v4();

    const { data } = await upsertWritingBlock({
      variables: {
        pageContentId,
        writingBlock: {
          id: newId,
          content: {},
        },
      },
    });

    if (data) {
      innerContent.current = data.documentUpsertWritingBlock.content;
      props.updateAttributes({ writingBlockId: newId });
    }
  };

  const updateContent = (content: JSONContent) => {
    if (isEmptyUuid(writingBlockId)) return;
    upsertDebounced({
      variables: {
        pageContentId,
        writingBlock: {
          id: writingBlockId,
          content,
        },
      },
    });
    innerContent.current = content;
  };

  const forceSave = (content: JSONContent) => {
    if (isEmptyUuid(writingBlockId)) return;
    cancel();
    upsertWritingBlock({
      variables: {
        pageContentId,
        writingBlock: {
          id: writingBlockId,
          content,
        },
      },
    });
    innerContent.current = content;
  };
  if (initializing) {
    return (
      <NodeViewWrapper>
        <ExtensionWrapper selected={props.selected}>
          <Trans>Initializing...</Trans>
          <Loading />
        </ExtensionWrapper>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <ExtensionWrapper selected={props.selected}>
        <WritingEditor
          body={innerContent.current}
          onUpdate={updateContent}
          onForceSave={forceSave}
        />
      </ExtensionWrapper>
    </NodeViewWrapper>
  );
};

type WritingEditorProps = {
  body: JSONContent;
  onUpdate: (content: JSONContent) => void;
  onForceSave: (content: JSONContent) => void;
};

const WritingEditor = ({ body, onUpdate, onForceSave }: WritingEditorProps) => {
  const allow = usePermission();
  const editor = useIkigaiEditor({
    body,
    onUpdate,
    onForceSave,
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
    <>
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
    </>
  );
};

export default WritingBlockComponent;
