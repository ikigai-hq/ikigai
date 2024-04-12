import { useEffect, useRef, useState } from "react";
import { Text, TextWeight } from "components/common/Text";
import {
  BackPlay,
  ForwardPlay,
  PauseIcon,
  PlayIcon,
  RecordAudio,
} from "components/common/IconSvg";
import { secondsToTimestamp } from "util/Time";
import { GroupOptions, RecordingBox, TogglePlay } from "../recordStyles";
import { Button, Divider, Space } from "antd";
import { CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import AudioPlayer from "./AudioPlayer";
import AnalyserCanvas from "./AnalyserCanvas";
import { useTheme } from "styled-components";
import { isMobileView } from "hook/UseSupportMobile";
import useDurationRecorder from "hook/UseDurationRecorder";

export type Props = {
  cancelRecord: () => void;
  endRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  uploading: boolean;
  audioStream: any;
  isRecording: boolean;
  chunks: Blob[];
};

const RecordingAudioBlock = ({
  cancelRecord,
  endRecording,
  pauseRecording,
  resumeRecording,
  uploading,
  audioStream,
  isRecording,
  chunks,
}: Props) => {
  const theme = useTheme();
  const [isPause, setPause] = useState(true);
  const [audio, setAudio] = useState(null);
  const repairedRef = useRef(null);
  const durationTime = useDurationRecorder(isRecording);

  const handleToggleRecord = async () => {
    if (isRecording) {
      pauseRecording();
    } else {
      setPause(true);
      resumeRecording();
    }
  };

  useEffect(() => {
    repairedRef.current = URL.createObjectURL(
      new Blob([new File(chunks, "")], { type: undefined }),
    );
  }, [!isRecording]);

  const isMobile = isMobileView();

  return (
    <RecordingBox>
      {!isRecording && (
        <AudioPlayer
          syncData={(data) => setAudio(data)}
          src={repairedRef.current}
          onlyWave
          contentType="blob"
          isRecordingBlock
        />
      )}
      <div
        style={{
          position: isRecording ? "relative" : "absolute",
          opacity: isRecording ? 1 : 0,
        }}
      >
        <AnalyserCanvas audioStream={audioStream} />
      </div>
      <Space
        align="center"
        style={{
          justifyContent: "space-between",
          width: "100%",
          padding: "16px 0 26px 0",
        }}
      >
        <Text color={theme.colors.gray[6]} level={1} weight={TextWeight.medium}>
          {secondsToTimestamp(0)}
        </Text>
        <Text color={theme.colors.gray[9]} level={4} weight={TextWeight.bold}>
          {secondsToTimestamp(durationTime)}
        </Text>
        <Text color={theme.colors.gray[6]} level={1} weight={TextWeight.medium}>
          {secondsToTimestamp(durationTime)}
        </Text>
      </Space>
      {!isMobile && (
        <GroupOptions>
          <TogglePlay
            size={44}
            onClick={handleToggleRecord}
          >
            {isRecording ? (
              <PauseIcon color={theme.colors.gray[0]} />
            ) : (
              <RecordAudio width={20} height={20} />
            )}
          </TogglePlay>
          <Space align="center" size={30} style={{ justifyContent: "center" }}>
            <Button
              type="link"
              block
              disabled={isRecording}
              onClick={() => audio.skip(-15)}
            >
              <BackPlay
                color={
                  isRecording ? theme.colors.gray[5] : theme.colors.gray[9]
                }
              />
            </Button>
            <Button
              onClick={() => {
                setPause(audio.isPlaying());
                audio.playPause();
              }}
              type="link"
              block
              disabled={isRecording}
            >
              {isPause ? (
                <PlayIcon
                  color={
                    isRecording ? theme.colors.gray[5] : theme.colors.gray[9]
                  }
                />
              ) : (
                <PauseIcon color={theme.colors.gray[9]} />
              )}
            </Button>
            <Button
              type="link"
              block
              disabled={isRecording}
              onClick={() => audio.skip(15)}
            >
              <ForwardPlay
                color={
                  isRecording ? theme.colors.gray[5] : theme.colors.gray[9]
                }
              />
            </Button>
          </Space>
          <Space size={20} style={{ justifyContent: "end" }}>
            <Button danger type="link" block onClick={cancelRecord}>
              <Space align="center">
                <DeleteOutlined />
                Cancel
              </Space>
            </Button>
            <Button
              loading={uploading}
              type="link"
              block
              onClick={endRecording}
            >
              <Space align="center">
                <CheckCircleOutlined />
                Completed
              </Space>
            </Button>
          </Space>
        </GroupOptions>
      )}
      {isMobile && (
        <div>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <TogglePlay
                size={44}
                onClick={handleToggleRecord}
              >
                {isRecording ? (
                  <PauseIcon color={theme.colors.gray[0]} />
                ) : (
                  <RecordAudio width={20} height={20} />
                )}
              </TogglePlay>
            </div>
            <Space
              align="center"
              size={10}
              style={{ justifyContent: "center" }}
            >
              <Button
                type="link"
                block
                disabled={isRecording}
                onClick={() => audio.skip(-15)}
              >
                <BackPlay
                  color={
                    isRecording ? theme.colors.gray[5] : theme.colors.gray[9]
                  }
                />
              </Button>
              <Button
                onClick={() => {
                  setPause(audio.isPlaying());
                  audio.handleTogglePlay();
                }}
                type="link"
                block
                disabled={isRecording}
              >
                {isPause ? (
                  <PlayIcon
                    color={
                      isRecording ? theme.colors.gray[5] : theme.colors.gray[9]
                    }
                  />
                ) : (
                  <PauseIcon color={theme.colors.gray[9]} />
                )}
              </Button>
              <Button
                type="link"
                block
                disabled={isRecording}
                onClick={() => audio.skip(15)}
              >
                <ForwardPlay
                  color={
                    isRecording ? theme.colors.gray[5] : theme.colors.gray[9]
                  }
                />
              </Button>
            </Space>
          </div>
          <Divider />
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Button danger type="link" block onClick={cancelRecord}>
              <Space align="center">
                <DeleteOutlined />
                Cancel
              </Space>
            </Button>
            <Button
              loading={uploading}
              type="link"
              block
              onClick={endRecording}
            >
              <Space align="center">
                <CheckCircleOutlined />
                Completed
              </Space>
            </Button>
          </div>
        </div>
      )}
    </RecordingBox>
  );
};

export default RecordingAudioBlock;
