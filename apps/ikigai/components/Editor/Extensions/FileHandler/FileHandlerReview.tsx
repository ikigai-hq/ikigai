import { GetDownloadUrl, GetFile } from "graphql/types";
import { Text } from "@radix-ui/themes";
import { round } from "lodash";
import { t } from "@lingui/macro";
import { FileIcon } from "@radix-ui/react-icons";
import { useLazyQuery } from "@apollo/client";
import { GET_DOWNLOAD_URL_BY_PAGE_CONTENT_ID } from "../../../../graphql/query";
import { handleError } from "../../../../graphql/ApolloClient";

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
  const [getDownloadUrl] = useLazyQuery<GetDownloadUrl>(
    GET_DOWNLOAD_URL_BY_PAGE_CONTENT_ID,
    {
      onError: handleError,
    },
  );
  const onClick = async () => {
    if (downloadUrl) {
      window.open(downloadUrl);
    } else {
      const { data } = await getDownloadUrl({
        variables: {
          fileId: file.getFile.uuid,
          pageContentId,
        },
      });

      if (data) {
        window.open(data.getFile.downloadUrlByPageContentId, "_blank");
      }
    }
  };

  return (
    <div
      style={{ display: "flex", gap: 4, alignItems: "center" }}
      onDoubleClick={onClick}
    >
      <FileIcon />
      <Text weight="medium">{file.getFile.fileName}</Text>
      <Text size="1" color="gray">
        {formatContentLength(file.getFile.contentLength)}
      </Text>
    </div>
  );
};

export default FileHandlerReview;
