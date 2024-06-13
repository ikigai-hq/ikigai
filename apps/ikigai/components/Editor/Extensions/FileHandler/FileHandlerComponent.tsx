import { NodeViewWrapper } from "@tiptap/react";
import { NodeViewProps } from "@tiptap/core";
import React, { useEffect, useState } from "react";
import { UploadIcon } from "@radix-ui/react-icons";
import { Text } from "@radix-ui/themes";

import { BlockExtensionWrapper } from "components/base/ExtensionComponentUtil";
import FileUploader from "components/base/FileUploader";
import { useQuery } from "@apollo/client";
import { GET_FILE } from "graphql/query";
import { handleError } from "graphql/ApolloClient";

import { EMPTY_UUID, FileResponse } from "util/FileUtil";
import { GetFile } from "graphql/types";
import Loading from "components/Loading";
import FileHandlerReview from "./FileHandlerReview";

const FileHandler = (props: NodeViewProps) => {
  const pageContentId =
    props.editor.options.editorProps.attributes["pageContentId"];
  const { data, loading } = useQuery<GetFile>(GET_FILE, {
    skip:
      !props.node.attrs.fileId ||
      props.node.attrs.fileId === EMPTY_UUID ||
      !pageContentId,
    onError: handleError,
    variables: {
      fileId: props.node.attrs.fileId,
      pageContentId,
    },
  });
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>();

  const onUploadComplete = (res: FileResponse) => {
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
      <BlockExtensionWrapper $selected={props.selected}>
        {loading && <Loading />}
        {!data && !loading && (
          <div>
            <FileUploader onComplete={onUploadComplete}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <UploadIcon />
                <Text align="center">Click here to upload</Text>
              </div>
            </FileUploader>
          </div>
        )}
        {data && (
          <FileHandlerReview
            pageContentId={pageContentId}
            downloadUrl={downloadUrl}
            file={data}
          />
        )}
      </BlockExtensionWrapper>
    </NodeViewWrapper>
  );
};

export default FileHandler;
