import { NodeViewWrapper } from "@tiptap/react";
import { NodeViewProps } from "@tiptap/core";
import React, { useEffect, useState } from "react";
import { UploadIcon } from "@radix-ui/react-icons";
import { Text } from "@radix-ui/themes";

import { ExtensionWrapper } from "components/base/ExtensionComponentUtil";
import FileUploader from "components/base/FileUploader";
import { useQuery } from "@apollo/client";
import { GET_FILE } from "graphql/query";
import { handleError } from "graphql/ApolloClient";

import { EMPTY_UUID, FileResponse } from "util/FileUtil";
import { GetFile } from "graphql/types";
import Loading from "components/Loading";
import FileHandlerReview from "./FileHandlerReview";
import styled from "styled-components";

const FileHandler = (props: NodeViewProps) => {
  const pageContentId = props.extension.options.pageContentId;
  const { data, loading } = useQuery<GetFile>(GET_FILE, {
    skip:
      !props.node.attrs.fileId ||
      props.node.attrs.fileId === EMPTY_UUID ||
      !pageContentId,
    onError: handleError,
    variables: {
      fileId: props.node.attrs.fileId,
    },
  });
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>();

  const onUploadComplete = async (res: FileResponse) => {
    props.updateAttributes({
      fileId: res.fileCreate.file.uuid,
    });
    setDownloadUrl(res.downloadUrl);
  };

  useEffect(() => {
    const fileId = props.node.attrs.fileId || EMPTY_UUID;
    if (fileId !== EMPTY_UUID) {
    }
  }, [props.node.attrs.fileId]);

  return (
    <NodeViewWrapper className="file-handler-component">
      <ExtensionWrapper selected={props.selected}>
        {loading && <Loading />}
        {!data && !loading && (
          <FileUploader onComplete={onUploadComplete}>
            <FileUploaderWrapper>
              <UploadIcon style={{ marginLeft: 5 }} />
              <Text weight="medium">Click here to upload</Text>
            </FileUploaderWrapper>
          </FileUploader>
        )}
        {data && (
          <FileHandlerReview
            pageContentId={pageContentId}
            downloadUrl={downloadUrl}
            file={data}
          />
        )}
      </ExtensionWrapper>
    </NodeViewWrapper>
  );
};

const FileUploaderWrapper = styled.div`
  background-color: var(--indigo-3);
  padding-top: 5px;
  padding-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  cursor: pointer;
`;

export default FileHandler;
