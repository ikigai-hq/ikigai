import React, { useEffect } from "react";

import { Button, Modal, Switch, Tooltip } from "antd";
import {
  CloudDownloadOutlined,
  DownloadOutlined,
  EllipsisOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  RetweetOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { FileAttrs, FileNodeAttrs } from "./type";
import { isAudio, isFileSupport, isImage, isPdf } from "util/FileType";
import { t, Trans } from "@lingui/macro";
import {
  DropdownItemContainer,
  FileHeaderContainer,
} from "../../BlockComponents/styles";
import { BlockDropdownMenu } from "../../BlockComponents";
import { Text } from "../../../Text";
import { DEFAULT_FILE_ID } from "./utils";
import { ConfirmPopup } from "util/ConfirmPopup";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";

interface FileBlockHeaderProps {
  name: string;
  files: FileAttrs[];
  selectedFile: FileAttrs;
  selectedDownloadUrl?: string;
  showPreview: boolean;
  isFullScreen?: boolean;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: () => void;
  handleFullScreen: (fileId: string, isOpen: boolean) => void;
  onChangeAttrs: (newAttrs: Partial<FileNodeAttrs>) => void;
  handleSelectBlock: () => void;
  handleSelectFile: (file: FileAttrs, index: number) => void;
  handleZoom?: (zoom: number) => void;
  audioSubmissionReplay?: boolean;
}

export const FileBlockHeader: React.FC<FileBlockHeaderProps> = (props) => {
  const {
    files,
    onChangeAttrs,
    selectedFile,
    handleDelete,
    handleFullScreen,
    isFullScreen,
    handleSelectBlock,
    selectedDownloadUrl,
    handleZoom,
    audioSubmissionReplay,
  } = props;
  const allow = usePermission();
  const [modal, contextHolder] = Modal.useModal();

  const pressDown = (e: KeyboardEvent) => {
    if (e.keyCode === 27 && isFullScreen) {
      handleFullScreen(selectedFile.fileId, false);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", pressDown);
    return () => {
      window.removeEventListener("keydown", pressDown);
    };
  }, [isFullScreen]);

  const onChangeDownloadable = (
    downloadable: boolean,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    const file = files.find((f) => f.fileId === selectedFile.fileId);
    if (file) {
      file.downloadable = downloadable;
      onChangeAttrs({ files });
    }
  };

  const onChangeAutoReplay = (
    replay: boolean,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    onChangeAttrs({ audioSubmissionReplay: replay });
  };

  const onResetFile = () => {
    modal.confirm(
      ConfirmPopup({
        title: t`Do you want to reset this file upload?`,
        onOk: () => {
          onChangeAttrs({
            files: [],
            fileId: DEFAULT_FILE_ID,
            name: "",
          });
        },
        content: "",
      }) as any,
    );
  };

  const canDownload =
    allow(DocumentActionPermission.EDIT_DOCUMENT) || selectedFile.downloadable;

  return (
    <FileHeaderContainer>
      {(isPdf(selectedFile.contentType) || isImage(selectedFile.contentType)) &&
        isFullScreen && (
          <>
            <Tooltip title={<Trans>ZoomIn</Trans>}>
              <Button
                icon={<ZoomInOutlined />}
                type="text"
                onClick={() => handleZoom(0.5)}
              />
            </Tooltip>
            <Tooltip title={<Trans>ZoomOut</Trans>}>
              <Button
                icon={<ZoomOutOutlined />}
                type="text"
                onClick={() => handleZoom(-0.5)}
              />
            </Tooltip>
          </>
        )}
      {!isAudio(selectedFile.contentType) &&
        isFileSupport(selectedFile.contentType) && (
          <Tooltip
            title={
              isFullScreen ? (
                <Trans>Exit Full Screen</Trans>
              ) : (
                <Trans>Full Screen</Trans>
              )
            }
          >
            <Button
              icon={
                isFullScreen ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                )
              }
              type="text"
              onClick={() =>
                handleFullScreen(selectedFile.fileId, !isFullScreen)
              }
            />
          </Tooltip>
        )}
      {canDownload && (
        <Tooltip title={<Trans>Download</Trans>}>
          <Button
            icon={<CloudDownloadOutlined />}
            type="text"
            onClick={() => window.open(selectedDownloadUrl, "_blank")}
          />
        </Tooltip>
      )}
      {allow(DocumentActionPermission.EDIT_DOCUMENT) && (
        <Tooltip title={<Trans>Reset</Trans>}>
          <Button
            icon={<RetweetOutlined />}
            type="text"
            onClick={onResetFile}
          />
        </Tooltip>
      )}
      {allow(DocumentActionPermission.EDIT_DOCUMENT) && (
        <BlockDropdownMenu
          handleSelect={handleSelectBlock}
          handleDelete={handleDelete}
          extendOptions={[
            {
              key: "replay",
              label: isAudio(selectedFile.contentType) ? (
                <div style={{ display: "flex" }}>
                  <DropdownItemContainer
                    size={6}
                    style={{ flex: 1, alignItems: "start" }}
                  >
                    <RetweetOutlined />
                    <Text level={1} strong>
                      <Trans>Allow replay in submission</Trans>
                    </Text>
                  </DropdownItemContainer>
                  <Switch
                    onChange={onChangeAutoReplay}
                    checked={audioSubmissionReplay}
                  />
                </div>
              ) : null,
            },
            {
              key: "2",
              label: (
                <div style={{ display: "flex" }}>
                  <DropdownItemContainer size={6} style={{ flex: 1 }}>
                    <DownloadOutlined />
                    <Text level={1} strong>
                      <Trans>Allow download</Trans>
                    </Text>
                  </DropdownItemContainer>
                  <Switch
                    onChange={onChangeDownloadable}
                    checked={!!selectedFile.downloadable}
                  />
                </div>
              ),
            },
          ]}
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </BlockDropdownMenu>
      )}
      {contextHolder}
    </FileHeaderContainer>
  );
};
