import { useEffect, useRef } from "react";
import { GroupOptions, RecordingBox } from "../recordStyles";
import { Divider, Space } from "antd";
import styled from "styled-components";
import VideoPlayer from "./VideoPlayer";
import VideoRecordingControlButtons from "./VideoRecordingControlButtons";
import { isMobileView } from "hook/UseSupportMobile";
import useDurationRecorder from "hook/UseDurationRecorder";

export type Props = {
  cancelRecord?: () => void;
  endRecording?: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  uploading?: boolean;
  isRecording?: boolean;
  stream?: any;
};

const RecordingVideoBlock = ({
  cancelRecord,
  endRecording,
  pauseRecording,
  resumeRecording,
  uploading,
  isRecording,
  stream,
}: Props) => {
  const videoRef = useRef(null);
  const repairedRef = useRef(null);
  const durationTime = useDurationRecorder(isRecording);

  useEffect(() => {
    videoRef.current?.setDurationTime(durationTime);
  }, [durationTime]);

  const setRecordVideo = () => {
    videoRef.current.videoRef.volume = 0;
    videoRef.current.videoRef.muted = true;
    videoRef.current.videoRef.srcObject = stream;
    videoRef.current.videoRef.controls = false;
    videoRef.current.videoRef.play().then(() => {
      console.log("??");
    });
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      pauseRecording();
      videoRef.current.videoRef.srcObject = null;
    } else {
      resumeRecording();
      setRecordVideo();
    }
  };

  useEffect(() => {
    if (!isRecording) return;
    if (videoRef.current.videoRef) {
      setRecordVideo();
    }
  }, [isRecording]);

  const isMobile = isMobileView();
  return (
    <RecordingBox type="video">
      <VideoPlayer
        ref={videoRef}
        controls={!isRecording}
        src={repairedRef.current}
      />
      {!isMobile && (
        <GroupOptions style={{ marginTop: 15 }}>
          <div />
          <Space align="center" style={{ justifyContent: "center" }}>
            <ButtonRecord
              isPause={!isRecording}
              onClick={() => handleToggleRecord()}
            />
          </Space>
          {isRecording ? (
            <div />
          ) : (
            <VideoRecordingControlButtons
              cancelRecord={cancelRecord}
              uploading={uploading}
              endRecording={endRecording}
            />
          )}
        </GroupOptions>
      )}
      {isMobile && (
        <div>
          <div style={{ display: "flex" }}>
            <Space
              align="center"
              style={{ margin: "0 auto", marginTop: "5px" }}
            >
              <ButtonRecord
                isPause={!isRecording}
                onClick={() => handleToggleRecord()}
              />
            </Space>
          </div>
          <Divider />
          {isRecording ? (
            <div />
          ) : (
            <VideoRecordingControlButtons
              cancelRecord={cancelRecord}
              uploading={uploading}
              endRecording={endRecording}
            />
          )}
        </div>
      )}
    </RecordingBox>
  );
};

const ButtonRecord = styled.div<{ isPause?: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 100px;
  background: ${(props) => props.theme.colors.gray[0]};
  position: relative;
  cursor: pointer;

  &::after {
    content: "";
    position: absolute;
    width: 28px;
    height: 28px;
    background: ${(props) => props.theme.colors.red[5]};
    border-radius: ${(props) => (props.isPause ? "100px" : "3px")};
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
`;

export default RecordingVideoBlock;
