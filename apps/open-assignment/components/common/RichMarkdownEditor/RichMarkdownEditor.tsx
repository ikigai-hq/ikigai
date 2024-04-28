import React, { useRef } from "react";
import { v4 } from "uuid";

import RichMarkdownEditor from "@open-assignment/editor";
import { Fragment, Node, Schema, Slice } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import { FileBlockNode } from "./extensions/FileExtension/FileNode";
import { embedList } from "./embed/embedList";
import { AudioRecordNode } from "./extensions/RecordExtension/AudioRecordNode";
import { VideoRecordNode } from "./extensions/RecordExtension/VideoRecordNode";
import { QUIZ_BLOCK_NAME, QuizNode } from "./extensions/QuizExtension/QuizNode";
import { CommonEmbedNode } from "./extensions/CommonEmbedExtension/CommonEmbedNode";
import FillInBlankNode, {
  FILL_IN_BLANK_NAME,
} from "./extensions/QuizExtension/FillInBlank/FillInBlankNode";
import { isZeroUUIDString } from "./utils";
import FeedbackTextNode from "./extensions/FeedbackText/FeedbackTextNode";
import styled, { useTheme } from "styled-components";
import useEditorActionStore from "context/ZustandEditorAction";
import { uploadFile } from "util/FileUtil";
import { FILE_BLOCK_NAME } from "./extensions/FileExtension/utils";
import toast from "react-hot-toast";
import { t } from "@lingui/macro";
import {
  PAGE_BLOCK_NAME,
  PageBlockNode,
} from "./extensions/PageBlockExtension/PageBlockNode";
import useDocumentStore, {
  PanelContentType,
} from "context/ZustandDocumentStore";
import useHighlightStore from "context/ZustandHighlightStore";
import { HighlightType } from "../../../graphql/types";
import { ZenCommonNode } from "./extensions/ZenNode/ZenNode";

export const removeMark = (fragment: Fragment | Node, markName: string) => {
  fragment.forEach((node: Node) => {
    const index = node.marks.findIndex((mark) => mark.type.name === markName);
    node.marks.splice(index, 1);
    removeMark(node.content, markName);
  });
};

export const findTransformBlocks = (
  fragment: Fragment | Node,
  nodeName: string,
): Node[] => {
  const blocks = [];
  fragment.forEach((node: Node) => {
    if (node.type.name === nodeName) {
      blocks.push(node);
    }

    blocks.push(...findTransformBlocks(node, nodeName));
  });

  return blocks;
};

const handleTransformPasted = (slice: Slice): Slice | null => {
  removeMark(slice.content, "annotation");
  // quizBlocks
  const quizBlocks = findTransformBlocks(slice.content, QUIZ_BLOCK_NAME);
  quizBlocks.forEach((quizBlock) => {
    if (quizBlock.attrs.quizId && !isZeroUUIDString(quizBlock.attrs.quizId)) {
      // It's totally existing quiz. Generate new id and add original quiz id to clone later
      quizBlock.attrs.originalQuizId = quizBlock.attrs.quizId;
      quizBlock.attrs.quizId = v4();
    }
  });

  // Fill in the Blank
  const fillInBlankBlocks = findTransformBlocks(
    slice.content,
    FILL_IN_BLANK_NAME,
  );
  fillInBlankBlocks.forEach((fillInBlankBlock) => {
    if (fillInBlankBlock.attrs.quizId) {
      fillInBlankBlock.attrs.originalQuizId = fillInBlankBlock.attrs.quizId;
      fillInBlankBlock.attrs.quizId = v4();
    }
  });

  // Page blocks
  const pageBlocks = findTransformBlocks(slice.content, PAGE_BLOCK_NAME);
  pageBlocks.forEach((pageBlock) => {
    if (pageBlock.attrs.pageBlockId) {
      pageBlock.attrs.originalPageBlockId = pageBlock.attrs.pageBlockId;
      pageBlock.attrs.pageBlockId = v4();
    }
  });

  return slice;
};

const customEditorStyle = (theme): React.CSSProperties => {
  return {
    minHeight: "400px",
    height: "100%",
    overflow: "auto",
    padding: "5px",
    border: `1px solid ${theme.colors.gray[4]}`,
    borderRadius: "4px",
  };
};

const readOnlyStyle: React.CSSProperties = {
  overflow: "auto",
};

interface CustomRichMarkdownEditorProps {
  isStyledEditor?: boolean;
  isFocusAtStart?: boolean;
  readOnly?: boolean;
  defaultVal?: string;
  documentId?: string;
  handleOnChange?: (value: string) => void;
  getCommands?: (command: Record<string, any>) => void;
  getSchemaProps?: (schema: Schema<any, any>) => void;
  getEditorView?: (editorView: EditorView<any>) => void;
  onSave?: ({ done }: { done: boolean }) => void;
  openBlockMenuOutside?: boolean;
  blockMenuPosition?: DOMRectList;
  isViewInMobileApp?: boolean;
  isNestedDoc?: boolean;
}

const CustomRichMarkdownEditor: React.FC<CustomRichMarkdownEditorProps> = (
  props,
) => {
  const {
    readOnly,
    defaultVal,
    handleOnChange,
    documentId,
    isStyledEditor,
    isFocusAtStart = false,
    getCommands,
    getSchemaProps,
    getEditorView,
    onSave,
    openBlockMenuOutside,
    blockMenuPosition,
    isViewInMobileApp,
    isNestedDoc,
  } = props;

  const theme = useTheme();
  const cacheBody = useRef(defaultVal);

  const rightPanelConfig = useDocumentStore(
    (state) => state.documentConfig.rightPanelTab,
  );
  const changeRightPanel = useDocumentStore((state) => state.changeRightPanel);
  const masterDocument = useDocumentStore((state) => state.masterDocument);

  const mapEditorAction = useEditorActionStore(
    (state) => state.mapEditorAction,
  );
  const updateEditorAction = useEditorActionStore(
    (state) => state.updateEditorAction,
  );
  const updateActiveDocumentEditorId = useEditorActionStore(
    (state) => state.updateActiveDocumentEditorId,
  );
  const setCurrentPointingEditor = useEditorActionStore(
    (state) => state.setCurrentPointingEditor,
  );

  const handleAddHighlight = useHighlightStore((state) => state.addHighlight);

  const styledEditor = readOnly ? readOnlyStyle : customEditorStyle(theme);
  const appliedStyledEditor = isStyledEditor ? styledEditor : undefined;

  const handleEditorChange = (value: () => string | undefined) => {
    const textVal = value();
    if (
      textVal !== "" &&
      textVal !== undefined &&
      textVal !== cacheBody.current
    ) {
      cacheBody.current = textVal;
      handleOnChange(textVal);
    }
  };

  const addFileBlock = async (files: FileList) => {
    const file = files[0];
    const res = await uploadFile({ uploadingFile: file });
    if (typeof res !== "string") {
      const commands = mapEditorAction.get(documentId);
      if (commands && commands.commands[FILE_BLOCK_NAME]) {
        const command = commands.commands[FILE_BLOCK_NAME];
        command({
          fileId: res.uuid,
          name: res.fileName,
          contentType: res.contentType,
          publicUrl: res.publicUrl,
        });
      } else {
        console.error("Cannot find file block");
      }
    }
  };

  // Only support 1 file first
  const onFilesPasted = async (files: FileList) => {
    if (files.length > 0) {
      await toast.promise(addFileBlock(files), {
        loading: t`Pasted file processing`,
        success: t`Uploaded!`,
        error: t`Cannot process file`,
      });
    }
  };

  const updateRefs = (ref: RichMarkdownEditor) => {
    if (ref) updateEditorAction(ref.props.documentId, ref);
  };

  const addHighlight = async (
    uuid?: string,
    type?: HighlightType,
    originalText?: string,
  ) => {
    if (uuid && type) {
      await handleAddHighlight({
        newHighlight: {
          fromPos: 0,
          toPos: 0,
          uuid,
          documentId,
          highlightType: type,
          originalText,
        },
      });
    }
  };

  return (
    <RickMarkdownEditorContainer>
      <RichMarkdownEditor
        getEditorRef={updateRefs}
        activeDocumentEditorId={(documentId) => {
          updateActiveDocumentEditorId(documentId);
        }}
        watchEditorStateChange={(state: EditorState, documentId: string) => {
          setCurrentPointingEditor(state, documentId);
        }}
        autoFocus
        openBlockMenuOutside={openBlockMenuOutside}
        blockMenuPosition={blockMenuPosition}
        getCommands={getCommands}
        getSchemaProps={getSchemaProps}
        getEditorView={getEditorView}
        isFocusAtStart={isFocusAtStart}
        documentId={documentId} // documentId is required when add annotation plugin.
        readOnly={readOnly}
        defaultValue={defaultVal}
        embeds={embedList}
        extensions={
          [
            new FileBlockNode(),
            new AudioRecordNode(),
            new VideoRecordNode(),
            new QuizNode(),
            new FillInBlankNode(),
            new CommonEmbedNode(),
            new FeedbackTextNode(),
            new PageBlockNode(),
            new ZenCommonNode({ type: "tableOfContent" }),
          ] as any[]
        }
        styledEditor={appliedStyledEditor}
        editorConfig={masterDocument.editorConfig}
        onChange={handleEditorChange}
        onSave={onSave}
        transformPasted={handleTransformPasted}
        disableFloatingMenu={isViewInMobileApp}
        disableExtensions={isViewInMobileApp ? ["blockmenu"] : undefined}
        disableDragAndDrop={isViewInMobileApp || isNestedDoc || readOnly}
        isEnablePageBlock={!isNestedDoc}
        onPastedFiles={onFilesPasted}
        addHighlight={addHighlight}
        openFeedback={(highlightId) => {
          if (highlightId) {
            rightPanelConfig !== PanelContentType.Feedback &&
              changeRightPanel(PanelContentType.Feedback);
            useHighlightStore.setState({ selectedHighlight: highlightId });
          }
        }}
      />
    </RickMarkdownEditorContainer>
  );
};

const RickMarkdownEditorContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  word-break: break-word;
`;

export default CustomRichMarkdownEditor;
