import { useQuery } from "@apollo/client";

import {
  GET_FULL_FILE_INFO,
} from "graphql/query";
import { handleError } from "graphql/ApolloClient";
import { GetFullFileInfo } from "graphql/types";
import Loading from "components/Loading";
import { RecordBlockBody, RecordBox } from "../recordStyles";
import AudioPlayer from "./AudioPlayer";
import VideoPlayer from "./VideoPlayer";

export type VideoPlayerWithTypeIdProps = {
  documentId: string;
  fileId: string;
  recordType: "video" | "audio";
  isRecording: boolean;
};

const VideoPlayerWithFileId = ({
  fileId,
  recordType,
  isRecording,
  documentId,
}: VideoPlayerWithTypeIdProps) => {
  const { data: originalFile } = useQuery<GetFullFileInfo>(GET_FULL_FILE_INFO, {
    variables: {
      fileId,
      documentId,
    },
    onError: handleError,
  });

  if (!originalFile) return <Loading />;

  const url = originalFile.getFile.downloadUrlByDocumentId;
  const fileRes = originalFile.getFile;
  return (
    <RecordBlockBody
      style={{
        display: isRecording ? "none" : "block",
      }}
    >
      {recordType === "audio" && (
        <RecordBox
          style={{
            display: url.length > 0 ? "" : "none",
          }}
        >
          <AudioPlayer
            src={url}
            recording={isRecording}
            contentType={originalFile.getFile.contentType}
            isRecordingBlock
          />
        </RecordBox>
      )}
      {recordType === "video" && !isRecording && (
        <VideoPlayer
          src={url}
          contentType={fileRes.contentType}
        />
      )}
    </RecordBlockBody>
  );
};

export default VideoPlayerWithFileId;
