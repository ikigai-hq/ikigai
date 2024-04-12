import { useMutation } from "@apollo/client";
import { handleError } from "graphql/ApolloClient";
import {
  DOCUMENT_ADD_PAGE_BLOCK,
  DOCUMENT_ADD_PAGE_BLOCK_DOCUMENT,
  DOCUMENT_CLONE_PAGE_BLOCK,
} from "graphql/mutation/DocumentMutation";
import {
  DocumentAddPageBlock,
  DocumentAddPageBlockVariables,
  PageViewMode,
  DocumentAddPageBlockDocument,
  DocumentAddPageBlockDocumentVariables,
  documentClonePageBlock,
  documentClonePageBlockVariables,
  GetPageBlocks_documentGet_pageBlocks_nestedDocuments as DocumentPageBlock,
} from "graphql/types";
import { v4 } from "uuid";
import React, { useEffect, useMemo, useState } from "react";
import { PageBlockAttrs } from "./type";
import usePageBlockStore from "context/ZustandPageBlockStore";
import { isZeroUUIDString } from "../../utils";
import styled from "styled-components";
import { InputWrapper } from "../../BlockComponents";
import { getNowAsSec } from "util/Time";
import useDocumentStore from "context/ZustandDocumentStore";
import { DEFAULT_DOCUMENT_TITLE } from "components/Document/common";
import { DocumentPermission } from "util/permission";
import useDocumentPermission from "hook/UseDocumentPermission";
import { Divider, Dropdown, MenuProps, Modal, Typography } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { Trans, t } from "@lingui/macro";
import { ConfirmPopup } from "util/ConfirmPopup";
import { debounce } from "lodash";
import useQuizStore from "context/ZustandQuizStore";
import {
  NestedDocumentContainer,
  NestedDocumentWrapper,
} from "./ReviewPageBlocks";
import RichMarkdownEditor from "@zkls/editor";
import { embedList } from "../../embed/embedList";
import Annotation from "@zkls/editor/dist/plugins/Annotation";
import { FileBlockNode } from "../FileExtension/FileNode";
import { AudioRecordNode } from "../RecordExtension/AudioRecordNode";
import { VideoRecordNode } from "../RecordExtension/VideoRecordNode";
import { QuizNode } from "../QuizExtension/QuizNode";
import FillInBlankNode from "../QuizExtension/FillInBlank/FillInBlankNode";
import { CommonEmbedNode } from "../CommonEmbedExtension/CommonEmbedNode";
import QuizDeletableManager from "../../NodeDeleteableManager";
import FeedbackTextNode from "../FeedbackText/FeedbackTextNode";
import { PageBlockNode } from "./PageBlockNode";

export type PageBlock = {
  attrs: PageBlockAttrs;
  documentId: string;
  onChangeAttrs: (newAttrs: PageBlockAttrs) => void;
  handleDelete: () => void;
  handleSelectAndCopy: () => void;
};

export const PageBlock: React.FC<PageBlock> = ({
  attrs,
  documentId,
  onChangeAttrs,
  handleDelete,
  handleSelectAndCopy,
}) => {
  const documentAllow = useDocumentPermission();
  const [isShowMoreActionBtn, setIsShowMoreActionBtn] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const updatePageBlockTitle = usePageBlockStore(
    (state) => state.updatePageBlockTitle,
  );
  const updateStore = usePageBlockStore((state) => state.updateStore);
  const updateCurrentPageBlockId = usePageBlockStore(
    (state) => state.updateCurrentPageBlockId,
  );
  const updatePageBlockMode = usePageBlockStore(
    (state) => state.updatePageBlockMode,
  );
  const pageBlocks = usePageBlockStore((state) => state.pageBlocks);

  const createDocument = useDocumentStore((state) => state.createDocument);
  const fetchAndSetDocument = useDocumentStore(
    (state) => state.fetchAndSetDocument,
  );

  const syncQuizzes = useQuizStore((state) => state.syncQuizzes);
  const updateQuizzes = useQuizStore((state) => state.updateQuizzes);
  const mapQuizBlockData = useQuizStore((state) => state.mapQuizBlockData);

  const totalQuizzes = pageBlocks
    .find((pb) => pb.id === attrs.pageBlockId)
    ?.nestedDocuments?.reduce((prevValue, currValue) => {
      return prevValue + mapQuizBlockData.get(currValue.documentId)?.length;
    }, 0);

  const [documentAddPageBlock] = useMutation<DocumentAddPageBlock>(
    DOCUMENT_ADD_PAGE_BLOCK,
    {
      onError: handleError,
    },
  );

  const [documentAddPageBlockDocument] =
    useMutation<DocumentAddPageBlockDocument>(
      DOCUMENT_ADD_PAGE_BLOCK_DOCUMENT,
      {
        onError: handleError,
      },
    );

  const [clonePageBlock, { loading: loadingClonePageBlock }] =
    useMutation<documentClonePageBlock>(DOCUMENT_CLONE_PAGE_BLOCK, {
      onError: () => {
        onChangeAttrs({
          originalPageBlockId: undefined,
        });
      },
      onCompleted: () => {
        onChangeAttrs({
          originalPageBlockId: undefined,
        });
      },
    });

  const addPageBlockDocument = async (
    pageBlockId: string,
    index: number,
  ): Promise<DocumentAddPageBlockDocument> => {
    const newDocumentId = await createDocument(DEFAULT_DOCUMENT_TITLE, "");

    if (newDocumentId) {
      const variables: DocumentAddPageBlockDocumentVariables = {
        data: {
          pageBlockId: pageBlockId,
          documentId: newDocumentId,
          index,
          createdAt: getNowAsSec(),
        },
      };
      const { data: pageBlockDocumentRes } = await documentAddPageBlockDocument(
        {
          variables,
        },
      );

      return pageBlockDocumentRes;
    }
  };

  const addPageBlock = async (pageBlockUuid: string) => {
    const variables: DocumentAddPageBlockVariables = {
      data: {
        id: pageBlockUuid,
        documentId,
        title: "",
        viewMode: PageViewMode.SPLIT,
      },
    };
    onChangeAttrs({ pageBlockId: pageBlockUuid });
    // No need shallow because add new one, need latest page blocks from store to handle update title or something else.
    updateStore({ id: pageBlockUuid }, true, false);
    const { data: pageBlockRes } = await documentAddPageBlock({
      variables,
    });

    if (pageBlockRes) {
      const { id } = pageBlockRes.documentAddPageBlock;
      const documentIds: { id: string; index: number }[] = [];
      if (attrs?.type === "single") {
        const res = await addPageBlockDocument(id, 0);
        documentIds.push({
          id: res.documentAddPageBlockDocument.documentId,
          index: res.documentAddPageBlockDocument.index,
        });
      } else {
        const res = await Promise.all([
          addPageBlockDocument(id, 0),
          addPageBlockDocument(id, 1),
        ]);
        documentIds.push(
          ...res.map((r) => ({
            id: r.documentAddPageBlockDocument.documentId,
            index: r.documentAddPageBlockDocument.index,
          })),
        );
      }
      // Get list document detail.
      const documents = await Promise.all(
        documentIds.map((d) => fetchAndSetDocument(d.id)),
      );
      documents.forEach((d) => {
        syncQuizzes(d.body, d.id);
        updateQuizzes(d.quizzes);
      });
      updateStore(
        {
          ...pageBlockRes.documentAddPageBlock,
          nestedDocuments: documents.map((d) => {
            const castingDocument: DocumentPageBlock = {
              pageBlockId: id,
              documentId: d.id,
              index:
                documentIds.find((docIndex) => docIndex.id === d.id)?.index ||
                0,
              document: {
                id: d.id,
                body: d.body,
              },
            };
            return castingDocument;
          }),
        },
        false,
        false,
      );
    }
  };

  const handleClonePageBlock = async () => {
    const variables: documentClonePageBlockVariables = {
      fromId: attrs.originalPageBlockId,
      toId: attrs.pageBlockId,
      toDocumentId: documentId,
    };
    const res = await clonePageBlock({ variables });
    if (res.data.documentClonePageBlock) {
      updateStore(res.data.documentClonePageBlock, true, false);
      const documents = await Promise.all(
        res.data.documentClonePageBlock.nestedDocuments.map((nd) =>
          fetchAndSetDocument(nd.documentId),
        ),
      );
      documents.forEach((d) => {
        syncQuizzes(d.body, d.id);
        updateQuizzes(d.quizzes);
      });
    }
  };

  useEffect(() => {
    if (isZeroUUIDString(attrs.pageBlockId)) {
      addPageBlock(v4());
    }
  }, [documentId, attrs.pageBlockId]);

  useEffect(() => {
    if (
      attrs.originalPageBlockId &&
      !isZeroUUIDString(attrs.pageBlockId) &&
      !isZeroUUIDString(attrs.originalPageBlockId) &&
      !loadingClonePageBlock &&
      documentId
    ) {
      // Clone pageblock
      handleClonePageBlock();
    }
  }, [attrs.originalPageBlockId]);

  const reviewPageBlock = () => {
    fetchAndSetDocument(documentId);
    updateCurrentPageBlockId(attrs.pageBlockId);
    updatePageBlockMode(true);
  };

  const onDelete = () => {
    modal.confirm(
      ConfirmPopup({
        title: t`Do you want delete this page block?`,
        onOk: handleDelete,
        content: "",
      }) as any,
    );
  };

  const items: MenuProps["items"] = [
    {
      key: "selectAndCopy",
      onClick: handleSelectAndCopy,
      label: (
        <Typography.Text>
          <Trans>Select and copy</Trans>
        </Typography.Text>
      ),
    },
    {
      key: "delete",
      onClick: onDelete,
      label: (
        <Typography.Text type="danger">
          <Trans>Delete</Trans>
        </Typography.Text>
      ),
    },
  ];

  const updatePageBlockTitleDebounce = useMemo(
    () =>
      debounce(async (title: string) => {
        // Need shallow because no need get latest pageblocks.
        updateStore({ title, id: attrs.pageBlockId }, false, true);
        await updatePageBlockTitle(title, attrs.pageBlockId, documentId);
      }, 500),
    [attrs.pageBlockId],
  );

  const onChangeTitle = async (title: string) => {
    await updatePageBlockTitleDebounce(title);
  };

  return (
    <PageBlockContainer
      onMouseEnter={() => {
        documentAllow(DocumentPermission.EditDocument) &&
          setIsShowMoreActionBtn(true);
      }}
      onMouseLeave={() => {
        documentAllow(DocumentPermission.EditDocument) &&
          setIsShowMoreActionBtn(false);
      }}
    >
      {documentAllow(DocumentPermission.ManageDocument) && (
        <Dropdown arrow={false} trigger={["click"]} menu={{ items }}>
          <MoreAction $show={isShowMoreActionBtn}>
            <EllipsisOutlined />
          </MoreAction>
        </Dropdown>
      )}
      <PageBlockBg onClick={reviewPageBlock}>
        <NestedDocumentWrapper>
          {pageBlocks
            .find((pb) => pb.id === attrs.pageBlockId)
            ?.nestedDocuments?.map((d, index) => (
              <NestedDocumentContainer
                style={{ overflow: "hidden", pointerEvents: "none" }}
                key={d.documentId}
              >
                <RichMarkdownEditor
                  disableFloatingMenu
                  readOnly
                  documentId={d.documentId}
                  defaultValue={d.document.body}
                  embeds={embedList}
                  extensions={
                    [
                      new Annotation(),
                      new FileBlockNode(),
                      new AudioRecordNode(),
                      new VideoRecordNode(),
                      new QuizNode(),
                      new FillInBlankNode(),
                      new CommonEmbedNode(),
                      new FeedbackTextNode(),
                      new PageBlockNode(),
                    ] as any[]
                  }
                />

                {index % 2 === 0 && (
                  <Divider
                    type="vertical"
                    style={{
                      height: "100%",
                      margin: "0px",
                    }}
                  />
                )}
              </NestedDocumentContainer>
            ))}
        </NestedDocumentWrapper>
        <OpacityLayout />
      </PageBlockBg>
      <TitleWrapper>
        <InputWrapper
          style={{ margin: "4px 0", fontWeight: 600 }}
          autoSize
          bordered={false}
          disabled={!documentAllow(DocumentPermission.EditDocument)}
          defaultValue={
            pageBlocks.find((pb) => pb.id === attrs.pageBlockId)?.title
          }
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            onChangeTitle(value);
          }}
        />
        {totalQuizzes > 0 ? (
          <TotalQuestion>Total {totalQuizzes} question(s)</TotalQuestion>
        ) : null}
      </TitleWrapper>
      {contextHolder}
    </PageBlockContainer>
  );
};

const PageBlockContainer = styled.div`
  border-radius: 8px;
  border: ${(props) => `1px solid ${props.theme.colors.gray[3]}`};
  background: ${(props) => `${props.theme.colors.gray[0]}`};
  width: 100%;
  margin: 8px 0;
`;

const MoreAction = styled.div<{ $show: boolean }>`
  position: absolute;
  right: 48px;
  cursor: pointer;
  padding: 8px;
  display: ${(props) => (props.$show ? "block" : "none")};
  z-index: 2;
`;

const PageBlockBg = styled.div`
  cursor: pointer;
  height: 317px;
`;

const OpacityLayout = styled.div`
  background: ${(props) => props.theme.colors.gray[2]};
  opacity: 0.6;
  width: 100%;
  height: 317px;
  position: relative;
  bottom: 317px;
  left: 0px;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  border-top: ${(props) => `1px solid ${props.theme.colors.gray[3]}`};
`;

const TotalQuestion = styled.div`
  margin-right: 12px;
`;
