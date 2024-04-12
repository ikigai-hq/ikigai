import React, { useEffect, useState } from "react";

import { FileImageOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Space, Upload } from "antd";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import styled, { useTheme } from "styled-components";

import { AddMore } from "components/common/IconSvg";
import { Text } from "components/common/Text";
import { FileInfo, uploadFile } from "util/FileUtil";
import { Trans } from "@lingui/macro";

const UploadBox = styled(Upload)`
  .ant-upload.ant-upload-select-picture-card {
    width: 290px;
    height: 290px;
    margin: 0px;
    background: ${(props) => props.theme.colors.gray[0]};
  }

  .ant-upload-list-picture-card-container {
    width: 290px;
    height: 290px;
  }

  .ant-upload-list-item-info:hover {
    background: none;
  }

  .ant-upload-list-item-info::before {
    left: 0;
  }

  box-sizing: border-box;
  width: 290px;
  height: 290px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 16px;
`;

const AddMediaIcon = styled.div`
  border-radius: 100%;
  background: ${(props) => props.theme.colors.gray[1]};
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

interface Props {
  uploadSuccess: (fileId: string) => void;
  removeImg: (id: string) => void;
  files?: UploadFile[];
}

export const ImageUploader: React.FC<Props> = ({
  uploadSuccess,
  removeImg,
  files,
}) => {
  const theme = useTheme();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (files) {
      setFileList(files);
    }
  }, [files]);

  const handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
    setFileList(info.fileList);
  };

  const handleUpload = async (options: RcCustomRequestOptions) => {
    const { onSuccess, file } = options;

    const res = (await uploadFile({
      uploadingFile: file as File,
      isPublic: true,
    })) as FileInfo;

    if (res) {
      uploadSuccess(res.uuid);
      onSuccess(res, null);
    }
  };

  return (
    <UploadBox
      accept="image/*, video/*"
      customRequest={handleUpload}
      listType="picture-card"
      onChange={handleChange}
      fileList={fileList}
      onRemove={({ uid }) => removeImg(uid)}
    >
      {fileList.length ? null : (
        <Space size={15} direction="vertical">
          <AddMediaIcon>
            <AddMore style={{ width: "35px", height: "35px" }} />
          </AddMediaIcon>
          <Text level={2} color={theme.colors.gray[8]}>
            <Trans>Upload Media</Trans>
          </Text>
          <Space size={20}>
            <FileImageOutlined
              style={{
                fontSize: "20px",
                color: theme.colors.gray[8],
                cursor: "pointer",
              }}
            />
            <VideoCameraOutlined
              style={{
                fontSize: "20px",
                color: theme.colors.gray[8],
                cursor: "pointer",
              }}
            />
          </Space>
        </Space>
      )}
    </UploadBox>
  );
};
