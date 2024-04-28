import styled, { useTheme } from "styled-components";

import { PanelTitle, QuestionPanelContainer, Section } from "./common";
import { Trans } from "@lingui/macro";
import useHighlightStore, {
  HighlightData,
} from "context/ZustandHighlightStore";
import { Avatar, Dropdown, Space } from "antd";
import {
  CreateCommentVariables,
  GetHighlightDocument_documentGet_highlights_thread_comments as IComment,
  GetHighlightDocument_documentGet_highlights_thread as IThread,
  ThreadCommentType,
} from "graphql/types";
import AvatarWithName from "components/AvatarWithName";
import { fromNow } from "util/Time";
import { Text } from "components/common/Text";
import usePageBlockStore from "context/ZustandPageBlockStore";
import useAuthUserStore from "context/ZustandAuthStore";
import { InputArea } from "components/common/Input";
import { useEffect, useState } from "react";
import { Button } from "components/common/Button";
import { MoreDocument, SendIcon } from "components/common/IconSvg";
import type { MenuProps } from "antd";
import useDocumentStore, {
  PanelContentType,
} from "context/ZustandDocumentStore";
import getMarkPos from "@open-assignment/editor/dist/lib/getMarkPos";
import useEditorActionStore from "context/ZustandEditorAction";
import { NodeSelection } from "prosemirror-state";

const CommentInput = ({
  highlightId,
  thread,
  initComment,
}: {
  highlightId: string;
  thread: IThread;
  initComment?: string;
}) => {
  const theme = useTheme();
  const currentUser = useAuthUserStore((state) => state.currentUser);
  const addComment = useHighlightStore((state) => state.addComment);
  const [comment, setComment] = useState<string>(initComment || "");
  const [isFocus, setFocus] = useState<boolean>(!!initComment);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const submit = async () => {
    if (comment.trim() && !submitting) {
      setSubmitting(true);
      const variables: CreateCommentVariables = {
        newComment: {
          commentType: ThreadCommentType.TEXT,
          threadId: thread.id,
          content: comment,
        },
      };
      await addComment(variables, highlightId);
      setComment("");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {!initComment && (
        <Avatar
          size={25}
          src={currentUser?.userMe.avatar?.publicUrl}
          style={{ minWidth: 25, marginTop: 3 }}
        />
      )}
      {isFocus ? (
        <div style={{ width: "100%", position: "relative" }}>
          <InputArea
            autoFocus
            minLength={3}
            style={{ padding: "4px 6px 26px 6px", fontSize: 14 }}
            autoSize={{ minRows: 2 }}
            placeholder="Reply..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onFocus={() => setFocus(true)}
            onClick={(e) => e.stopPropagation()}
            onBlur={() => {
              if (!comment) {
                setFocus(false);
                setComment("");
              }
            }}
            onPressEnter={() => {
              setFocus(false);
              submit();
            }}
            $isActive={true}
          />
          <SendIcon
            style={{
              width: 21,
              height: 21,
              color: comment.trim()
                ? theme.colors.primary[5]
                : theme.colors.gray[4],
              position: "absolute",
              bottom: 5,
              right: 5,
            }}
            onClick={submit}
          />
        </div>
      ) : (
        <InputArea
          style={{ padding: "4px 6px", fontSize: 14 }}
          autoSize={true}
          placeholder="Reply..."
          onFocus={() => setFocus(true)}
        />
      )}
    </div>
  );
};

const Highlight = ({
  highlight,
  thread,
  isActive,
}: {
  highlight: HighlightData;
  thread: IThread;
  isActive: boolean;
}) => {
  const currentUser = useAuthUserStore((state) => state.currentUser);
  const checkHelper = useAuthUserStore((state) => state.checkHelper);
  const isStudent = checkHelper.isStudent;
  const removeComment = useHighlightStore((state) => state.removeComment);
  const editorAction = useEditorActionStore((state) =>
    state.mapEditorAction.get(highlight.documentId),
  );
  const [selectedComment, setComment] = useState(null);
  const ownerThread = thread.creator.id === currentUser?.userMe?.id;

  const onClick = (highlightId: string) => {
    if (document) {
      useHighlightStore.setState({ selectedHighlight: highlightId });
      const element = document.getElementById(highlightId);
      if (element) {
        element.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
        element.focus();
      }
    }
  };

  const dropdownHighlight: MenuProps["items"] = [
    {
      label: (
        <div
          onClick={(e) => {
            e.stopPropagation();
            // removeHighlight({ highlightId: highlight.id });
            if (editorAction.editorView) {
              const markInfo = getMarkPos(
                editorAction.editorView,
                highlight.id,
              );
              const marks = markInfo?.marks;
              const annotationType =
                editorAction.editorView.state.schema.marks.annotation;
              const strikethroughType =
                editorAction.editorView.state.schema.marks.strikethrough;
              // Remove annotation first.
              editorAction.editorView.dispatch(
                editorAction.editorView.state.tr.removeMark(
                  markInfo.start,
                  markInfo.end,
                  annotationType,
                ),
              );
              // In case replace annotation.
              if (marks?.length) {
                // Find and get strikethrough mark.
                const strikethroughMark = marks.find((m) =>
                  m.node.marks?.find(
                    (item) => item.type.name === "strikethrough",
                  ),
                );
                if (strikethroughMark) {
                  // Remove strikethrough mark.
                  const endStrikethroughPos =
                    markInfo.start + strikethroughMark.node.nodeSize;
                  editorAction.editorView.dispatch(
                    editorAction.editorView.state.tr.removeMark(
                      markInfo.start,
                      endStrikethroughPos,
                      strikethroughType,
                    ),
                  );
                  // Set selection for node contain replaced word.
                  const tr = editorAction.editorView.state.tr.setSelection(
                    new NodeSelection(
                      editorAction.editorView.state.doc.resolve(
                        endStrikethroughPos,
                      ),
                    ),
                  );
                  // Remove replaced word.
                  editorAction.editorView.dispatch(
                    tr.replaceWith(
                      endStrikethroughPos,
                      markInfo.end,
                      editorAction.editorView.state.schema.text(" "),
                    ),
                  );
                }
              }
            }
          }}
        >
          <Trans>Delete Highlight</Trans>
        </div>
      ),
      danger: true,
      key: "1",
    },
  ];

  const dropdownComment: MenuProps["items"] = [
    {
      label: (
        <div
          onClick={(e) => {
            console.log("heyy");
            e.stopPropagation();
            removeComment(selectedComment, highlight.id);
          }}
        >
          <Trans>Delete Comment</Trans>
        </div>
      ),
      danger: true,
      key: "1",
    },
  ];

  return (
    <HighlightBlock onClick={() => onClick(highlight.id)} $active={isActive}>
      <div>
        <CommentBox $isActive={isActive}>
          <Space size={8} align="center">
            <AvatarWithName
              avatarSize={25}
              name={thread.creator.orgPersonalInformation?.fullName}
              avtUrl={thread.creator.orgPersonalInformation?.avatar?.publicUrl}
            />
          </Space>
          <div
            style={{
              justifyContent: "space-between",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Text level={0} style={{ marginLeft: 30 }}>
              {fromNow(thread.createdAt)}
            </Text>
            {(ownerThread || !isStudent) && (
              <Dropdown
                placement="bottomRight"
                menu={{ items: dropdownHighlight }}
                getPopupContainer={(trigger: any) => trigger.parentNode}
              >
                <Button size="small" type="text" icon={<MoreDocument />} />
              </Dropdown>
            )}
          </div>
          <>
            <Quote>
              {!highlight.type ? (
                highlight.content
              ) : (
                <div>
                  <b>Replace: </b>
                  <span>{highlight.originalText}</span>
                  &nbsp;
                  <b>by</b>
                  &nbsp;
                  <span>{highlight.content}</span>
                </div>
              )}
            </Quote>
          </>
        </CommentBox>
        {thread.comments.map((comment: IComment, index: number) => (
          <CommentBox key={comment.id} $isActive={isActive}>
            {(index === 0 ||
              comment.sender.id !==
                thread.comments[Math.max(index - 1, 0)].sender.id) && (
              <Space size={8} align="center">
                <AvatarWithName
                  avatarSize={25}
                  name={comment.sender.orgPersonalInformation?.fullName}
                  avtUrl={
                    comment.sender.orgPersonalInformation?.avatar?.publicUrl
                  }
                />
              </Space>
            )}
            <section>
              <Text level={0} style={{ marginLeft: 30 }}>
                {fromNow(comment.createdAt)}
              </Text>
              {comment.sender.id === currentUser?.userMe?.id && (
                <Dropdown
                  placement="bottomRight"
                  menu={{ items: dropdownComment }}
                  getPopupContainer={(trigger: any) => trigger.parentNode}
                  onOpenChange={() => setComment(comment.id)}
                >
                  <Button size="small" type="text" icon={<MoreDocument />} />
                </Dropdown>
              )}
            </section>
            <div style={{ margin: "2px 0 2px 30px" }}>
              <Text level={3}>{comment.content}</Text>
            </div>
          </CommentBox>
        ))}
      </div>
      <CommentInput highlightId={highlight.id} thread={thread} />
    </HighlightBlock>
  );
};

export const FeedbackPanel = () => {
  const pageBlockMode = usePageBlockStore((state) => state.pageBlockMode);
  const currentPageBlockId = usePageBlockStore(
    (state) => state.currentPageBlockId,
  );
  const nestedDocIds = usePageBlockStore(
    ({ pageBlocks, currentPageBlockId }) => {
      const docIds: string[] = [];
      pageBlocks
        .filter((pb) => pb.id === currentPageBlockId)
        .forEach((pb) => {
          docIds.push(...pb.nestedDocuments.map((d) => d.documentId));
        });
      return docIds;
    },
  );
  const highlights = useHighlightStore((state) => state.highlights);
  const threads = useHighlightStore((state) => state.threads);
  const selectedHighlight = useHighlightStore(
    (state) => state.selectedHighlight,
  );
  const masterDocumentId = useDocumentStore((state) => state.masterDocumentId);
  const rightPanelConfig = useDocumentStore(
    (state) => state.documentConfig.rightPanelTab,
  );
  const [activeHighlightIds, setActiveHighlightIds] = useState<string[]>([]);

  useEffect(() => {
    if (rightPanelConfig === PanelContentType.Feedback) {
      if (!pageBlockMode) {
        const filterHighlightIds = Array.from(highlights.values())
          .filter((hl) => hl.documentId === masterDocumentId)
          .map((hl) => hl.id);
        setActiveHighlightIds(
          filterHighlightIds?.sort(
            (pId, nId) =>
              threads.get(nId)?.createdAt - threads.get(pId)?.createdAt,
          ),
        );
      } else {
        const docIds = pageBlockMode ? nestedDocIds : [masterDocumentId];
        const filterHighlightIds = Array.from(highlights.values())
          .filter((hl) => docIds.includes(hl.documentId))
          .map((hl) => hl.id);
        setActiveHighlightIds(
          filterHighlightIds.sort(
            (pId, nId) =>
              threads.get(nId)?.createdAt - threads.get(pId)?.createdAt,
          ),
        );
      }
    }
  }, [
    rightPanelConfig,
    pageBlockMode,
    highlights,
    threads,
    currentPageBlockId,
  ]);

  useEffect(() => {
    if (document) {
      const element = document.getElementById(`${selectedHighlight}-panel`);
      if (element) {
        element.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
        element.focus();
      }
    }
  }, [activeHighlightIds, selectedHighlight]);

  return (
    <QuestionPanelContainer>
      <Section>
        <PanelTitle>
          <Trans>COMMENTS</Trans>
        </PanelTitle>
      </Section>
      {activeHighlightIds.map(
        (hlId) =>
          highlights.get(hlId) &&
          threads.get(hlId) && (
            <div id={`${hlId}-panel`} key={hlId}>
              <Highlight
                highlight={highlights.get(hlId)}
                thread={threads.get(hlId)}
                isActive={hlId === selectedHighlight}
              />
            </div>
          ),
      )}
    </QuestionPanelContainer>
  );
};

const CommentBox = styled.div<{ $isActive?: boolean }>`
  margin-bottom: 4px;

  &&& {
    section {
      flex: 1;
      min-width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
`;

const HighlightBlock = styled.div<{ $active?: boolean }>`
  cursor: pointer;
  border-top: ${(props) =>
    props.$active ? "none" : "1px solid rgba(55, 53, 47, 0.09)"};
  margin: 0 -12px;
  padding: 12px;
  transition: background 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: ${(props) =>
    props.$active ? "rgba(182, 201, 255, 0.47)" : "transparent"};
  border-radius: 8px;

  &:hover {
    background: ${(props) =>
      props.$active ? "rgba(182, 201, 255, 0.47)" : props.theme.colors.gray[1]};
  }

  .ant-dropdown-menu-title-content {
    font-size: 12px;
    font-weight: 500;
  }
`;

const Quote = styled.div`
  border-left: 3px solid #1c53f4;
  color: ${(props) => props.theme.colors.gray[8]};
  padding-left: 7px;
  margin-bottom: 10px;
  margin-top: 5px;
  margin-left: 30px;
  font-size: 16px;
  font-weight: 300;
  word-break: break-all;

  b {
    color: ${(props) => props.theme.colors.gray[9]};
  }
`;

export default FeedbackPanel;
