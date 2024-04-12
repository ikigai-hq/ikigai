/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { FileItem } from "util/FileUtil";

import {
  isAudio,
  isImage,
  isOfficeFile,
  isPdf,
  isVideo,
} from "../../util/FileType";
import OfficeFileViewer from "../OfficeFileViewer";
import VideoPlayer from "./VideoPlayer";

import { t } from "@lingui/macro";
import AudioPlayer from "./RichMarkdownEditor/extensions/RecordExtension/RecordPlayer/AudioPlayer";
import { TogglePlay } from "./RichMarkdownEditor/extensions/RecordExtension/recordStyles";
import { BackPlay, ForwardPlay, PauseIcon, PlayIcon } from "./IconSvg";
import { Button, Empty, Space } from "antd";
import { secondsToTimestamp } from "util/Time";
import ImagePreview from "./FilePreview/Image";
import useSubmissionStatus from "hook/UseSubmissionStatus";
import useDocumentStore from "context/ZustandDocumentStore";

const PdfViewer1 = dynamic(() => import("components/PdfViewer/PdfViewer1"), {
  ssr: false,
});

interface Props {
  fileItem: FileItem;
  isFullScreen?: boolean;
  setFullScreen?: React.Dispatch<React.SetStateAction<boolean>>;
  handleFullScreen?: (isOpen: boolean) => void;
  handleZoom?: (zooom: number) => void;
  downloadUrl: string;
  height: number;
  width: number;
  zoom?: number;
  audioSubmissionReplay?: boolean;
}

const FilePreview: React.FC<Props> = (props) => {
  const {
    fileItem,
    isFullScreen,
    downloadUrl,
    setFullScreen,
    height,
    width,
    zoom,
    handleFullScreen,
    handleZoom,
    audioSubmissionReplay,
  } = props;
  const { contentType, fileId } = fileItem;
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const masterDocument = useDocumentStore((state) => state.masterDocument);
  const isAudioReplay = !(
    useSubmissionStatus(masterDocument).isDoingSubmission &&
    !audioSubmissionReplay
  );

  useEffect(() => {
    function existFullScreen() {
      if (document.fullscreenElement === null && fileId) {
        setFullScreen(false);
      }
    }

    document.addEventListener("fullscreenchange", existFullScreen);

    return () =>
      document.removeEventListener("fullscreenchange", existFullScreen);
  }, []);

  // Pdf file
  if (isPdf(contentType)) {
    return (
      <PdfViewer1
        width={width}
        height={height}
        fileUrl={downloadUrl}
        fileId={fileId}
        zoom={zoom}
        isFullScreen={isFullScreen}
      />
    );
  }

  // Image file
  if (isImage(contentType)) {
    return (
      <ImagePreview
        fileItem={fileItem}
        isFullScreen={isFullScreen}
        downloadUrl={downloadUrl}
        zoom={zoom}
        handleFullScreen={handleFullScreen}
        handleZoom={handleZoom}
      />
    );
  }

  // Office file
  if (isOfficeFile(contentType)) {
    return (
      <OfficeFileViewer
        height={`${height}px`}
        isFullScreen={isFullScreen}
        url={downloadUrl}
      />
    );
  }

  if (isVideo(contentType)) {
    if (width && height) {
      const ratio = `${width}:${Math.round(height)}`;

      return (
        <div className="media-container" style={{ height: "100%" }}>
          <VideoPlayer
            options={{
              sources: [
                {
                  src: downloadUrl,
                  type: contentType,
                },
              ],
              audioOnlyMode: isAudio(contentType),
              aspectRatio: ratio,
            }}
          />
        </div>
      );
    }
    return null;
  }

  if (isAudio(contentType)) {
    const togglePlay = () => {
      setIsPlaying(!audio.isPlaying());
      audio?.playPause();
    };

    audio?.on("audioprocess", () => {
      setCurrentTime(audio?.getCurrentTime());
    });

    audio?.on("seek", () => {
      setCurrentTime(audio?.getCurrentTime());
    });

    return (
      <div style={{ padding: "30px 15px 20px 15px", textAlign: "center" }}>
        <AudioPlayer
          syncData={(data) => setAudio(data)}
          src={downloadUrl}
          onlyWave={true}
          contentType={contentType}
          replay={isAudioReplay}
          fileId={fileId}
        />
        {audio && (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                padding: "10px 0",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 12 }}>00:00</div>
              <b style={{ fontSize: 20 }}>{secondsToTimestamp(currentTime)}</b>
              <div style={{ fontSize: 12 }}>
                {secondsToTimestamp(audio?.getDuration())}
              </div>
            </div>
            <Space
              align="center"
              size={10}
              style={{ justifyContent: "center" }}
            >
              {isAudioReplay && (
                <Button type="link" block onClick={() => audio.skip(-15)}>
                  <BackPlay />
                </Button>
              )}
              <TogglePlay onClick={togglePlay}>
                {isPlaying ? (
                  <PauseIcon color="#ffffff" />
                ) : (
                  <PlayIcon color="#ffffff" style={{ marginLeft: 2 }} />
                )}
              </TogglePlay>
              {isAudioReplay && (
                <Button type="link" block onClick={() => audio.skip(15)}>
                  <ForwardPlay />
                </Button>
              )}
            </Space>
          </div>
        )}
      </div>
    );
  }

  // Another file
  return (
    <div style={{ padding: 10 }}>
      <Empty description={t`We do not yet support the preview of this file`} />
    </div>
  );
};

export default FilePreview;
