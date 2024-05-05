import usePageBlockStore from "context/ZustandPageBlockStore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { BlockTitleMemo } from "../../BlockComponents";
import { Divider } from "antd";
import {
  DocumentActionPermission,
  GetDocumentDetail_documentGet as IDocument,
  GetPageBlocks_documentGet_pageBlocks as IPageBlock,
} from "graphql/types";
import Editor from "components/Document/Editor";
import { QuestionBoxes } from "./QuestionBoxes";
import useDocumentStore from "context/ZustandDocumentStore";
import useSupportMobile from "hook/UseSupportMobile";
import { DEFAULT_LEFT_SIDE_WIDTH, DEFAULT_RIGHT_SIDE_WIDTH } from "util/index";
import { BreakPoints } from "styles/mediaQuery";
import { debounce } from "lodash";
import usePermission from "hook/UsePermission";

export const ReviewPageBlocks: React.FC<{
  isPresentationMode?: boolean;
  masterDocumentId?: number;
  isViewInMobileApp?: boolean;
}> = ({ isPresentationMode, isViewInMobileApp }) => {
  const pageBlockRef = useRef<HTMLDivElement>(null);
  const [maxWidthPageBlock, setMaxWidthPageBlock] = useState(0);
  const allow = usePermission();
  const { isMobileView } = useSupportMobile();

  const leftPanelHidden = useDocumentStore((state) => state.leftPanelHidden);
  const rightPanelHidden = useDocumentStore((state) => state.rightPanelHidden);
  const mapAvailableDocument = useDocumentStore(
    (state) => state.mapAvailableDocument,
  );

  const pageBlocks = usePageBlockStore((state) => state.pageBlocks);
  const currentPageBlockId = usePageBlockStore(
    (state) => state.currentPageBlockId,
  );
  const updatePageBlockTitle = usePageBlockStore(
    (state) => state.updatePageBlockTitle,
  );
  const updateStore = usePageBlockStore((state) => state.updateStore);

  const [pageBlockInfo, setPageBlockInfo] = useState<IPageBlock>();
  const [nestedDocs, setNestedDocs] = useState<IDocument[]>([]);

  useEffect(() => {
    if (currentPageBlockId) {
      const existingPbData = pageBlocks.find(
        (pb) => pb.id === currentPageBlockId,
      );
      if (existingPbData) {
        setPageBlockInfo(existingPbData);
        setNestedDocs(
          existingPbData.nestedDocuments.map((d) =>
            mapAvailableDocument.get(d.document.id),
          ),
        );
      }
    }
  }, [currentPageBlockId, pageBlocks]);

  const updatePageBlockTitleDebounce = useMemo(
    () =>
      debounce(async (title: string) => {
        if (pageBlockInfo) {
          updateStore({ title, id: pageBlockInfo.id }, false, true);
          await updatePageBlockTitle(
            title,
            pageBlockInfo.id,
            pageBlockInfo.documentId,
          );
        }
      }, 500),
    [pageBlockInfo],
  );

  const onChangeTitle = async (title: string) => {
    await updatePageBlockTitleDebounce(title);
  };

  useEffect(() => {
    if (!pageBlockRef.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      if (pageBlockRef.current) {
        setMaxWidthPageBlock(pageBlockRef.current.offsetWidth / 2);
      }
    });
    resizeObserver.observe(pageBlockRef.current);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [pageBlockRef.current]);

  return (
    <ReviewPageBlockContainer
      ref={pageBlockRef}
      $maxWidth={
        isMobileView
          ? 0
          : (!leftPanelHidden ? DEFAULT_LEFT_SIDE_WIDTH : 0) +
            (!rightPanelHidden ? DEFAULT_RIGHT_SIDE_WIDTH : 0)
      }
    >
      {!isPresentationMode && (
        <PageBlockHeader>
          <QuestionBoxes documentId={pageBlockInfo?.documentId} />
        </PageBlockHeader>
      )}

      <div>
        <BlockTitle
          key={pageBlockInfo?.id}
          isSetValue={false}
          defaultTitle={pageBlockInfo?.title}
          readonly={!allow(DocumentActionPermission.EDIT_DOCUMENT)}
          onChangeTitle={onChangeTitle}
        />
        <TitleDivider />
      </div>
      <PageBlockBody>
        <NestedDocumentWrapper>
          {nestedDocs.map((nd, index) => {
            return (
              <NestedDocumentContainer
                $maxWidth={maxWidthPageBlock}
                key={nd?.id}
              >
                <Editor
                  isViewInMobileApp={isViewInMobileApp}
                  isNestedDoc
                  document={nd}
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
            );
          })}
        </NestedDocumentWrapper>
      </PageBlockBody>
    </ReviewPageBlockContainer>
  );
};

const ReviewPageBlockContainer = styled.div<{
  $isPublishedPage?: boolean;
  $maxWidth?: number;
}>`
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--gray-4, #eaecef);
  background: ${(props) => props.theme.colors.gray[0]};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;

  ${BreakPoints.tablet} {
    max-width: 100%;
    overflow: auto;
  }
`;

const PageBlockHeader = styled.div`
  background: ${(props) => props.theme.colors.extraBackground1};
  padding: 18px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${BreakPoints.tablet} {
    padding: 1rem;
  }
`;

const PageBlockBody = styled.div`
  overflow: hidden;
  height: 100%;
`;

export const NestedDocumentContainer = styled.div<{ $maxWidth?: number }>`
  display: flex;
  width: 100%;
  // max-width: ${(props) => props.$maxWidth}px;

  ${BreakPoints.tablet} {
    max-width: 100%;
    height: 50%;
  }
`;

export const NestedDocumentWrapper = styled.div<{ $height?: number }>`
  display: flex;
  flex: 1;
  height: ${(props) => props.$height || 100}%;
  box-sizing: border-box;

  ${BreakPoints.tablet} {
    display: block;
    padding-bottom: 0;

    .ant-divider {
      display: none;
    }

    ${NestedDocumentContainer} {
      &:not(:last-child) {
        border-bottom: 4px solid #eaecef;
      }
    }
  }
`;

const TitleDivider = styled(Divider)`
  margin: 0;

  ${BreakPoints.tablet} {
    margin: 0;
  }
`;

const BlockTitle = styled(BlockTitleMemo.type)`
  padding: 8px 3rem;
  font-size: 18px;
  box-sizing: border-box;
  font-weight: 600;

  ${BreakPoints.tablet} {
    padding: 8px 1rem;
  }
`;
