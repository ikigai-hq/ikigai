import React, { useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { RcFile } from "antd/lib/upload/interface";

import { Text } from "components/common/Text";

import { CircleStyled, DraggerStyled } from "./FileUpload";
import Spacer from "./Spacer";
import { Trans } from "@lingui/macro";
import { useTheme } from "styled-components";

interface Props {
  handleUploadLocalFiles: (files: RcFile[]) => void;
  isDirectory?: boolean;
}

export const ManualFileUpload: React.FC<Props> = ({
  handleUploadLocalFiles,
  isDirectory = true,
}) => {
  const theme = useTheme();
  const [fileList, setFileList] = useState<RcFile[]>([]);

  const handleBeforeUpload = (_, files: RcFile[]) => {
    setFileList(files);
    handleUploadLocalFiles(files);
    return false;
  };

  const onRemoveFile = (file: RcFile) => {
    const newFiles = fileList.filter((f) => f.uid !== file.uid);
    setFileList(newFiles);
    handleUploadLocalFiles(newFiles);
  };

  return (
    <>
      <DraggerStyled
        directory={isDirectory}
        fileList={fileList}
        beforeUpload={handleBeforeUpload}
        onRemove={onRemoveFile}
      >
        <CircleStyled style={{ height: 90 }}>
          <PlusOutlined style={{ color: theme.colors.blue[5] }} />
        </CircleStyled>
        <Spacer size={20} />
        <Text level={2}>
          <Trans>Click or drag file to this area to upload</Trans>
        </Text>
      </DraggerStyled>
    </>
  );
};
