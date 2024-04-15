import React, { memo, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { CarouselRef } from "antd/lib/carousel";
import dynamic from "next/dynamic";
import { EditorView } from "prosemirror-view";
import { copyBlock } from "@openexam/editor/dist/util/copyBlock";
import { useQuery } from "@apollo/client";

import { FileUploadResponse } from "components/common/AddResourceModal";
import { FileAttrs, FileNodeAttrs, Size } from "./type";
import FileUpload from "../../../FileUpload";
import { isZeroUUIDString } from "../../utils";
import { GetDownloadTranscodingUrl, GetFullFileInfo } from "graphql/types";
import {
  GET_DOWNLOAD_TRANSCODING_URL,
  GET_FULL_FILE_INFO,
} from "graphql/query";
import { handleError } from "graphql/ApolloClient";
import Loading from "components/Loading";
import { FileBlockHeader } from "./FileBlockHeader";
import { ResizeBox } from "components/common/RichMarkdownEditor/extensions/FileExtension/ResizeBox";
import { CommonContainer } from "components/Document/common";
import { TrashFile } from "components/common/IconSvg";
import { isAudio, isFileSupport, isImage, isPdf, isVideo } from "util/FileType";
import { DEFAULT_SIZE } from "./utils";
import {
  BlockBodyContainer,
  BlockContainer,
} from "../../BlockComponents/styles";
import { BlockTitleMemo } from "../../BlockComponents";
import { DocumentPermission } from "util/permission";
import useDocumentPermission from "hook/UseDocumentPermission";
import useSupportMobile from "hook/UseSupportMobile";
import { Badge } from "antd";
import { t } from "@lingui/macro";
import { useTheme } from "styled-components";

const FilePreview = dynamic(() => import("components/common/FilePreview"), {
  ssr: false,
});

//@ts-ignore
const FilePreviewMemo = memo(FilePreview, (pre, next) => {
  return (
    pre.downloadUrl === next.downloadUrl &&
    pre.isFullScreen === next.isFullScreen &&
    pre.height === next.height &&
    pre.width === next.width &&
    pre.zoom === next.zoom &&
    pre.fileItem.contentType === next.fileItem.contentType
  );
});

export type FileBlockProps = {
  documentId: string;
  size: Size;
  name: string;
  files: FileAttrs[];
  onChangeAttrs: (newAttrs: Partial<FileNodeAttrs>) => void;
  onDelete: () => void;
  view?: EditorView;
  isSelected: boolean;
  handleSelect: () => void;
  isFullScreen: boolean;
  setFullScreen: (state: boolean) => void;
  audioSubmissionReplay?: boolean;
};

const FileBlock = ({
  documentId,
  size,
  name,
  files,
  onChangeAttrs,
  onDelete,
  view,
  isSelected,
  handleSelect,
  isFullScreen,
  setFullScreen,
  audioSubmissionReplay,
}: FileBlockProps) => {
  const theme = useTheme();
  const { height, width } = size;
  const initContent = useRef<boolean>(true);
  const commonRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<CarouselRef>(null);
  const [resizeParent, setResizeParent] = useState<number>(0);

  const [showPreview, setShowPreview] = useState(true);
  const [zoom, setZoom] = useState(1);
  const documentAllow = useDocumentPermission();
  const { isMobileView } = useSupportMobile();

  // Previous version: Just support single uploaded file => need to keep the old version to prevent mismatch logic.
  // Current version: support multiple uploaded files => need to set first selection.
  const [selectedFile, setSelectedFile] = useState<FileAttrs | undefined>(
    files[0],
  );

  const { data: originalFile } = useQuery<GetFullFileInfo>(GET_FULL_FILE_INFO, {
    skip:
      !selectedFile ||
      !selectedFile.fileId ||
      isZeroUUIDString(selectedFile.fileId) ||
      !documentId,
    variables: {
      fileId: selectedFile?.fileId,
      documentId,
    },
    onError: handleError,
  });
  const { data: transcodingUrlData } = useQuery<GetDownloadTranscodingUrl>(
    GET_DOWNLOAD_TRANSCODING_URL,
    {
      skip:
        !selectedFile ||
        !selectedFile.fileId ||
        isZeroUUIDString(selectedFile.fileId) ||
        !documentId,
      variables: {
        fileId: selectedFile?.fileId,
        documentId,
      },
    },
  );

  useEffect(() => {
    // Case: change name of file => change attrs of block => re-render => need to keep current selected file.
    if (files.length > 1 && carouselRef && selectedFile) {
      const index = files.findIndex((f) => f.fileId === selectedFile.fileId);
      carouselRef.current?.goTo(index);
      setSelectedFile(selectedFile);
      return;
    }

    if (files.length) {
      setSelectedFile(files[0]);
    }

    if (files.length > 1 && carouselRef) {
      carouselRef.current?.goTo(0);
    }
  }, [files]);

  useEffect(() => {
    if (!commonRef.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      if (commonRef.current) {
        setResizeParent(commonRef.current.offsetWidth);
      }
    });
    resizeObserver.observe(commonRef.current);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [commonRef.current]);

  const handleFullScreen = (fileId: string, isOpen: boolean) => {
    if (fileId === selectedFile.fileId) {
      if (isFullScreen) {
        commonRef.current.querySelector("div").style.transition = "none";
        commonRef.current.querySelector("div").style.width = `${width}px`;
        commonRef.current.querySelector("div").style.height = `${height}px`;
      } else {
        commonRef.current.querySelector("div").style.transition = "0.3s all";
        commonRef.current.querySelector("div").style.width =
          "calc(100vw - 20px)";
        commonRef.current.querySelector("div").style.height =
          "calc(100vh - 20px)";
        commonRef.current.querySelector("div").style.margin = "auto";
      }
      setFullScreen(isOpen);
      handleZoom(-(zoom - 1));
    }
  };

  const onSelectFile = (file: FileNodeAttrs, index: number) => {
    if (!carouselRef.current) return;
    carouselRef.current.goTo(index);
    setSelectedFile(file);
  };

  const handleZoom = (size: number) => {
    if (zoom + size > 0 && zoom + size < 2.5) {
      setZoom(zoom + size);
    }
  };

  const handleRemoveUploadBlock = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    onDelete();
  };

  const renderSingleFilePreview = (
    contentType: string,
    downloadUrl?: string,
  ) => {
    return (
      <div style={{ height: "100%" }}>
        {!downloadUrl ? (
          <Loading />
        ) : (
          <ModalContainer $isFullScreen={isFullScreen}>
            <FilePreviewMemo
              width={width}
              height={height}
              fileItem={{
                fileId: selectedFile.fileId,
                fileName: selectedFile.name,
                publicUrl: downloadUrl,
                contentType: contentType,
              }}
              isFullScreen={isFullScreen}
              setFullScreen={setFullScreen}
              downloadUrl={downloadUrl}
              zoom={zoom}
              handleFullScreen={(isOpen) =>
                handleFullScreen(selectedFile.fileId, isOpen)
              }
              handleZoom={handleZoom}
              audioSubmissionReplay={audioSubmissionReplay}
            />
          </ModalContainer>
        )}
      </div>
    );
  };

  if (files.length && selectedFile) {
    const downloadUrl =
      transcodingUrlData?.fileGetDownloadTranscodingUrl ||
      originalFile?.getFile?.downloadUrlByDocumentId;
    const fileUuid = originalFile?.getFile?.uuid;
    const contentType =
      originalFile?.getFile?.transcodingOutputContentType ||
      originalFile?.getFile?.contentType;

    if (downloadUrl && initContent.current && !isAudio(contentType)) {
      if (!width && !height) {
        const widthParent = (
          document.querySelector(".ProseMirror") as HTMLElement
        ).offsetWidth;
        if (isImage(contentType)) {
          const img = new Image();
          img.src = downloadUrl;
          img.onload = () => {
            onChangeAttrs({
              size: {
                width:
                  img.naturalWidth > widthParent
                    ? widthParent
                    : img.naturalWidth,
                height:
                  img.naturalWidth > widthParent
                    ? widthParent / (img.naturalWidth / img.naturalHeight)
                    : img.naturalHeight,
              },
            });
          };
        } else {
          const resizeHeight = isVideo(contentType)
            ? widthParent / (16 / 9)
            : DEFAULT_SIZE.height;
          onChangeAttrs({
            size: {
              width: isFileSupport(contentType) ? widthParent : 370,
              height: isFileSupport(contentType) ? resizeHeight : 150,
            },
          });
        }
        initContent.current = false;
      }
    }

    return (
      <div
        style={{
          userSelect: "none",
          marginBottom: "4px",
          background: isSelected ? "#ECFFF4" : "transparent",
        }}
      >
        <CommonContainer
          key={selectedFile.fileId}
          ref={commonRef}
          $isFullScreen={isFullScreen}
          $downloadable={selectedFile.downloadable}
        >
          <ResizeBox
            resizeParent={resizeParent}
            disabled={
              isFullScreen || isMobileView || !isFileSupport(contentType)
                ? true
                : isAudio(contentType)
            }
            initialSize={{
              height: isAudio(contentType) ? undefined : height,
              width: isAudio(contentType) ? undefined : width,
            }}
            getResizableDimension={({ width, height }) => {
              onChangeAttrs({ size: { width, height } });
            }}
            isPdf={isPdf(contentType)}
            isAudio={isAudio(contentType)}
            isFullScreen={isFullScreen}
          >
            <Badge.Ribbon
              text={selectedFile.downloadable ? t`Downloadable` : ""}
              placement="start"
              color={theme.colors.primary[6]}
            >
              <BlockContainer
                style={{ userSelect: "none", margin: 0 }}
                onCopy={(event) => copyBlock(view, event as any)}
                $isSelected={isSelected}
                $defaultBg={isImage(contentType) ? "none" : ""}
              >
                <FileBlockHeader
                  name={name}
                  files={files}
                  selectedFile={selectedFile}
                  selectedDownloadUrl={downloadUrl}
                  handleDelete={onDelete}
                  handleFullScreen={handleFullScreen}
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                  isFullScreen={isFullScreen}
                  onChangeAttrs={onChangeAttrs}
                  handleSelectBlock={handleSelect}
                  handleSelectFile={onSelectFile}
                  handleZoom={handleZoom}
                  audioSubmissionReplay={audioSubmissionReplay}
                />

                <BlockBodyContainer style={{ padding: 0, height: "100%" }}>
                  {files.length === 1 && (
                    <div style={{ height: "100%" }} id={fileUuid}>
                      {renderSingleFilePreview(contentType, downloadUrl)}
                    </div>
                  )}
                </BlockBodyContainer>
              </BlockContainer>
            </Badge.Ribbon>
          </ResizeBox>
        </CommonContainer>
        <div key={width + height}>
          <BlockTitleMemo
            style={{
              textAlign: "center",
            }}
            title={name}
            defaultTitle={name}
            onChangeTitle={(val) => {
              onChangeAttrs({
                name: val,
              });
            }}
            readonly={!documentAllow(DocumentPermission.EditDocument)}
          />
        </div>
      </div>
    );
  }

  return (
    <UploadContainer>
      <FileUpload
        handleAddFileUuid={(uploadedFile: FileUploadResponse) => {
          const files = [
            {
              fileId: uploadedFile.uuid,
              name: uploadedFile.name,
              contentType: uploadedFile.contentType,
              publicUrl: uploadedFile.publicUrl,
              createdAt: uploadedFile.createdAt,
            },
          ];
          onChangeAttrs({
            name: files[0].name,
            files,
          });
        }}
        isPublic={false}
        multiple={false}
      />
      <TraskIconContainer onClick={handleRemoveUploadBlock}>
        <TrashFile />
      </TraskIconContainer>
    </UploadContainer>
  );
};

const UploadContainer = styled.div`
  margin: 12px 0;
  max-width: 332px;
  position: relative;
`;

const TraskIconContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
  padding: 16px;
`;

const ModalContainer = styled.div<{ $isFullScreen: boolean }>`
  height: 100%;
  ${(props) =>
    props.$isFullScreen &&
    `
      width: calc(100vw - 20px);
      height: calc(100vh - 20px);
    `}
`;

export default FileBlock;
