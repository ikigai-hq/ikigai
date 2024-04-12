import React, { useEffect, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { Progress, Upload } from "antd";
import { UploadChangeParam, UploadFile } from "antd/lib/upload/interface";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import styled, { useTheme } from "styled-components";
import toast from "react-hot-toast";

import { UploadingInformation, uploadFile, FileInfo } from "util/FileUtil";

import { Text } from "./Text";
import Spacer from "./Spacer";
import { FileUploadResponse } from "./AddResourceModal";
import { Trans, t } from "@lingui/macro";

export enum UploadStatus {
  DONE = "done",
  ERROR = "error",
}

interface Props {
  handleAddFileUuid?: (file: FileUploadResponse | FileUploadResponse[]) => void;
  parentFolderId?: string;
  isPublic?: boolean;
  children?: React.ReactNode;
  multiple?: boolean;
  acceptType?: string;
  showProgress?: boolean;
  onProgress?: (progress: number) => void;
}

const { Dragger } = Upload;

export const CircleStyled = styled.div`
  width: 90px;
  border-radius: 45px;
  background-color: ${(props) => props.theme.colors.gray[1]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DraggerStyled = styled(Dragger)<{ nonStyle?: boolean }>`
  height: ${(props) => (props.nonStyle ? "fit-content" : "100%")};

  .ant-upload-drag {
    background: unset;
  }

  .ant-upload-drag-container {
    display: flex !important;
    justify-content: center;
    align-items: center;
    flex: 1;
    flex-direction: column;
  }

  .ant-upload.ant-upload-btn {
    padding: ${(props) => (props.nonStyle ? 0 : "32px")};
  }
`;

const FileUpload: React.FC<Props> = ({
  handleAddFileUuid,
  parentFolderId,
  isPublic,
  children,
  multiple,
  acceptType,
  showProgress,
  onProgress,
}) => {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  const [countedUploadedFiles, setCountedUploadFiles] = useState(null);
  const [callbacks, setCallBacks] = useState<Promise<string | FileInfo>[]>([]);
  const [successCallbacks, setSuccessCallbacks] = useState<
    ((body: any, xhr?: XMLHttpRequest) => void)[]
  >([]);

  const handleOnChange = async (info: UploadChangeParam<UploadFile<any>>) => {
    const { status } = info.file;
    setCountedUploadFiles(info.fileList.length);

    switch (status) {
      case UploadStatus.DONE:
        toast.success(`${info.file.name} ${t`uploaded successfully.`}`);
        break;
      case UploadStatus.ERROR:
        toast.error(`${info.file.name} ${t`upload failed.`}`);
        break;
      default:
        break;
    }
  };

  const customRequest = async (options: RcCustomRequestOptions) => {
    const { onSuccess, file } = options;

    const fileUpload: UploadingInformation = {
      uploadingFile: file as File,
      isPublic: isPublic,
      parentFolderId: parentFolderId || null,
    };

    const config = {
      headers: { "content-type": "multipart/form-data" },
      onUploadProgress: (event) => {
        const percent = Math.floor((event.loaded / event.total) * 100);
        setProgress(percent);
        if (onProgress) onProgress(percent);
        if (percent === 100) {
          setTimeout(() => setProgress(0), 1000);
          setTimeout(() => onProgress && onProgress(0), 1000);
        }
      },
    };

    if (multiple) {
      const newCallbacks = [...callbacks, uploadFile(fileUpload, config)];
      const newSuccessCallbacks = [...successCallbacks, onSuccess];
      setCallBacks(newCallbacks);
      setSuccessCallbacks(newSuccessCallbacks);
    } else {
      const response = (await uploadFile(fileUpload, config)) as FileInfo;

      if (response) {
        const fileUuid: FileUploadResponse = {
          uuid: response.uuid,
          name: response.fileName,
          publicUrl: response.publicUrl,
          contentType: response.contentType,
        };
        handleAddFileUuid(fileUuid);
        onSuccess(response, null);
      }
    }
  };

  const resolvePromise = async () => {
    const result = (await Promise.all(callbacks)) as FileInfo[];
    const fileUuids: FileUploadResponse[] = result.map((r) => ({
      uuid: r.uuid,
      name: r.fileName,
      publicUrl: r.publicUrl,
      contentType: r.contentType,
    }));

    if (fileUuids.length === countedUploadedFiles) {
      handleAddFileUuid(fileUuids);
      successCallbacks.map((cb, index) => cb(result[index], null));
    }
  };

  useEffect(() => {
    resolvePromise();
  }, [callbacks]);

  const shouldShowProgress =
    progress && showProgress === undefined ? true : showProgress;

  return (
    <>
      <DraggerStyled
        name="file"
        multiple={multiple === undefined ? true : multiple}
        onChange={handleOnChange}
        customRequest={customRequest}
        showUploadList={false}
        nonStyle={!!children}
        accept={acceptType}
      >
        {children || (
          <>
            <CircleStyled style={{ height: 90, fontSize: 25 }}>
              <PlusOutlined style={{ color: theme.colors.blue[5] }} />
            </CircleStyled>
            <Spacer size={20} />
            <Text level={2}>
              <Trans>Click or drag file to this area to upload</Trans>
            </Text>
          </>
        )}
      </DraggerStyled>
      {shouldShowProgress ? <Progress percent={progress} /> : ""}
    </>
  );
};

export default FileUpload;
