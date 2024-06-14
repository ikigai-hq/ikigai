import { GetDownloadUrl, GetFile } from "graphql/types";
import { Text } from "@radix-ui/themes";
import { round } from "lodash";
import { t } from "@lingui/macro";
import { FileIcon } from "@radix-ui/react-icons";
import { useQuery } from "@apollo/client";
import { GET_DOWNLOAD_URL_BY_PAGE_CONTENT_ID } from "graphql/query";
import { handleError } from "graphql/ApolloClient";
import { isImage } from "util/FileUtil";
import Image from "next/image";
import styled from "styled-components";

const KB = 1024;
const MB = KB * 1024;

const formatContentLength = (contentLength: number) => {
  if (contentLength > MB) {
    return t`${round(contentLength / MB, 1)}MB`;
  }

  if (contentLength > KB) {
    return t`${round(contentLength / KB, 1)}KB`;
  }

  return t`${contentLength}B`;
};

export type FileHandlerReviewProps = {
  file: GetFile;
  pageContentId: string;
  downloadUrl?: string;
};

const FileHandlerReview = ({
  file,
  pageContentId,
  downloadUrl,
}: FileHandlerReviewProps) => {
  const { data } = useQuery<GetDownloadUrl>(
    GET_DOWNLOAD_URL_BY_PAGE_CONTENT_ID,
    {
      skip: !!downloadUrl,
      onError: handleError,
      variables: {
        fileId: file.getFile.uuid,
        pageContentId,
      },
    },
  );

  const onClick = async () => {
    if (downloadUrl) {
      window.open(downloadUrl);
    } else if (data) {
      window.open(data.getFile.downloadUrlByPageContentId, "_blank");
    }
  };

  const fileDownloadUrl =
    downloadUrl || data?.getFile?.downloadUrlByPageContentId;

  // Render Image
  if (isImage(file.getFile.contentType) && fileDownloadUrl) {
    return (
      <ImageWrapper>
        <Image src={fileDownloadUrl} layout={"fill"} alt={file.getFile.uuid} />
      </ImageWrapper>
    );
  }

  return (
    <NonSupportWrapper onDoubleClick={onClick}>
      <FileIcon />
      <Text weight="medium">{file.getFile.fileName}</Text>
      <Text size="1" color="gray">
        {formatContentLength(file.getFile.contentLength)}
      </Text>
    </NonSupportWrapper>
  );
};

const ImageWrapper = styled.div`
  width: 100%;
  min-height: 200px;
  position: relative;
  border-radius: 4px;
  aspect-ratio: 16/9 auto;
`;

const NonSupportWrapper = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 5px;
  background-color: var(--indigo-3);
`;

export default FileHandlerReview;
