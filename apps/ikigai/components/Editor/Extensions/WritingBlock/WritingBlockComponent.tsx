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
import { Card } from "@radix-ui/themes";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useDebounceFn } from "ahooks";
import { v4 } from "uuid";

import BaseEditor from "../../BaseEditor";
import { isEmptyUuid } from "util/FileUtil";
import { GET_WRITING_BLOCK } from "graphql/query/DocumentQuery";
import { handleError } from "graphql/ApolloClient";
import {
  DocumentActionPermission,
  GetWritingBlock,
  UpsertWritingBlock,
} from "graphql/types";
import { UPSERT_WRITING_BLOCK } from "graphql/mutation/DocumentMutation";
import Loading from "components/Loading";
import usePermission from "hook/UsePermission";

const WritingBlockComponent = (props: NodeViewProps) => {
  const allow = usePermission();
  const pageContentId = props.extension.options.pageContentId;
  const writingBlockId = props.node.attrs.writingBlockId;
  const [initializing, setInitializing] = useState(true);
  const innerContent = useRef<JSONContent>();

  const [upsertWritingBlock, { loading: createLoading }] =
    useMutation<UpsertWritingBlock>(UPSERT_WRITING_BLOCK, {
      onError: handleError,
    });
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
      await addNewWritingBlock();
    } else if (!createLoading || !loading) {
      await fetchWritingBlock({
        variables: {
          writingBlockId,
        },
      });
    }
    setInitializing(false);
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
        <Card>
          <Trans>Initializing...</Trans>
          <Loading />
        </Card>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <Card>
        <BaseEditor
          body={innerContent.current}
          onUpdate={updateContent}
          onForceSave={forceSave}
          extensions={[
            StarterKit,
            TaskList,
            TaskItem.configure({
              nested: true,
            }),
            Placeholder.configure({
              placeholder: t`Typing here...`,
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
          ]}
          readOnly={!allow(DocumentActionPermission.INTERACTIVE_WITH_TOOL)}
        />
      </Card>
    </NodeViewWrapper>
  );
};

export default WritingBlockComponent;
