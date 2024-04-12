import React, { useState } from "react";

import styled, { useTheme } from "styled-components";

import FileUpload from "components/common/FileUpload";
import { TrashFile } from "components/common/IconSvg";
import Spacer from "components/common/Spacer";

import { Button, TextButton } from "./Button";
import Modal from "../common/Modal";
import { Text, TextWeight } from "./Text";
import { Trans, t } from "@lingui/macro";

interface Props {
  lectureId?: number;
  visible: boolean;
  onClose: () => void;
  handleSaveFiles?: (fileUuids: FileUploadResponse[]) => void;
  handleDeleteFile: (fileUuid: string) => void;
  selectedFolderId: string;
}

export interface FileUploadResponse {
  uuid: string;
  name: string;
  publicUrl?: string;
  contentType: string;
  createdAt?: number;
}

export const ButtonContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: flex-end;
`;

export const FileReview = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const AddResourceModal: React.FC<Props> = ({
  lectureId,
  visible,
  onClose,
  handleSaveFiles,
  handleDeleteFile,
  selectedFolderId,
}) => {
  const theme = useTheme();
  const [fileUuids, setFileUuids] = useState<FileUploadResponse[]>([]);

  const handleSaveFile = () => {
    if (!fileUuids.length) return;

    if (lectureId) {
      refreshState();
      return;
    }

    handleSaveFiles(fileUuids);
    refreshState();
  };

  const refreshState = () => {
    setFileUuids([]);
    onClose();
  };

  const handleAddFileUuid = (file: FileUploadResponse) => {
    setFileUuids((prev) => [...prev, file]);
  };

  const handleRemoveFileUuid = (uuid: string) => {
    handleDeleteFile(uuid);
    setFileUuids((prev) => prev.filter((file) => file.uuid !== uuid));
  };

  const handleOnClickCancel = () => {
    if (fileUuids.length) {
      fileUuids.forEach((file) => handleDeleteFile(file.uuid));
    }
    refreshState();
  };

  const handleOnClose = selectedFolderId ? handleOnClickCancel : onClose;
  return (
    <Modal onClose={handleOnClose} visible={visible} title={t`Upload File`}>
      <FileUpload
        parentFolderId={selectedFolderId}
        handleAddFileUuid={handleAddFileUuid}
        isPublic={false}
      />
      <div>
        {fileUuids.map((file) => (
          <FileReview key={file.uuid}>
            <Text
              weight={TextWeight.bold}
              level={3}
              color={theme.colors.blue[5]}
            >
              {file.name}
            </Text>
            <TrashFile onClick={() => handleRemoveFileUuid(file.uuid)} />
          </FileReview>
        ))}
      </div>
      <ButtonContainer>
        {selectedFolderId && (
          <>
            <TextButton type="text" onClick={handleOnClickCancel}>
              <Text
                level={2}
                weight={TextWeight.bold}
                color={theme.colors.gray[6]}
              >
                <Trans>Cancel</Trans>
              </Text>
            </TextButton>
            <Spacer size={16} />
          </>
        )}
        <Button onClick={handleSaveFile} type="primary">
          <Trans>Upload</Trans>
        </Button>
      </ButtonContainer>
    </Modal>
  );
};

export default AddResourceModal;
