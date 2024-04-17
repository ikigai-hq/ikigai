import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";

import { RecordBlockAttrs } from "./type";
import { Dropdown, Space, Typography } from "antd";
import { uploadRecordingFile } from "util/FileUtil";
import { DocumentPermission } from "util/permission";
import useDocumentPermission from "hook/UseDocumentPermission";
import { Text, TextWeight } from "components/common/Text";
import { RecordAudio, RecordVideo } from "components/common/IconSvg";
import { RecordBlockContainer, RecordBox, TogglePlay } from "./recordStyles";
import { ExclamationCircleOutlined, MoreOutlined } from "@ant-design/icons";
import { Button, TextButtonBlock } from "components/common/Button";
import { MenuProps } from "antd/es";
import RecordingVideoBlock from "./RecordPlayer/RecordingVideoBlock";
import RecordingAudioBlock from "./RecordPlayer/RecordingAudioBlock";
import Modal from "components/common/Modal";
import {
  MediaPermissionsErrorType,
  requestMediaPermissions,
} from "util/requestMediaPermissions";
import useDocumentStore, { PermissionType } from "context/ZustandDocumentStore";
import Bowser from "bowser";
import { useTheme } from "styled-components";
import { t, Trans } from "@lingui/macro";
import VideoPlayerWithFileId from "./RecordPlayer/VideoPlayerWithFileId";

const RECORDING_SUPPORTED_TYPES = [
  {
    mime: "video/webm",
    extension: ".webm",
  },
  {
    mime: "video/mp4",
    extension: ".mp4",
  },
];

const RECORDING_AUDIO_SUPPORTED_TYPES = [
  {
    mime: "audio/ogg",
    extension: ".ogg",
  },
  {
    mime: "audio/mp3",
    extension: ".mp3",
  },
];

export type RecordBlockProps = {
  documentId: string;
  attrs: RecordBlockAttrs;
  onChangeAttrs: (newAttrs: RecordBlockAttrs) => void;
  handleDelete: () => void;
  recordType: "audio" | "video";
};

const RecordBlock = ({
  documentId,
  attrs,
  onChangeAttrs,
  handleDelete,
  recordType,
}: RecordBlockProps) => {
  const theme = useTheme();
  const recorder = useRef<MediaRecorder>();
  const currentStream = useRef<MediaStream>();
  const recordedChunks = useRef<Blob[]>([]);
  const [uploading, setUploading] = useState(false);
  const documentAllow = useDocumentPermission();
  const [modal, setModal] = useState(null);
  const browser = Bowser.getParser(window.navigator.userAgent);
  const browserName = browser.getBrowserName();
  const videoSupportedType = MediaRecorder.isTypeSupported(
    RECORDING_SUPPORTED_TYPES[0].mime,
  )
    ? RECORDING_SUPPORTED_TYPES[0]
    : RECORDING_SUPPORTED_TYPES[1];
  const audioSupportedType = MediaRecorder.isTypeSupported(
    RECORDING_AUDIO_SUPPORTED_TYPES[0].mime,
  )
    ? RECORDING_AUDIO_SUPPORTED_TYPES[0]
    : RECORDING_AUDIO_SUPPORTED_TYPES[1];

  const { permissions, setPermissions, isGranted } = useDocumentStore(
    (state) => {
      const getsPermissionStatuByType = (type) => {
        return recordType === "video"
          ? state.permissions.camera === type &&
              state.permissions.microphone === type
          : state.permissions.microphone === type;
      };
      return {
        permissions: state.permissions,
        setPermissions: state.setPermissions,
        isGranted: getsPermissionStatuByType(PermissionType.GRANTED),
      };
    },
  );

  const [recordMode, setRecordMode] = useState(false);
  const [isRecording, setRecording] = useState(false);
  const [stream, setStream] = useState(undefined);

  const _renderModalContent = (
    type?: MediaPermissionsErrorType,
    message?: string,
  ) => {
    const devices =
      recordType === "video" ? "Microphone & Camera" : "Microphone";

    switch (type) {
      case MediaPermissionsErrorType.PermissionDenied:
        if (browserName !== "Chrome" && browserName !== "Microsoft Edge") {
          setPermissions({
            camera:
              recordType === "video"
                ? PermissionType.DENIED
                : permissions.camera,
            microphone: PermissionType.DENIED,
          });
        }
        setModal({
          name: t`${devices} needs to be enabled`,
          message: `Open Exam needs your permission to access your ${devices} so others can hear you.
          Please go to your browser's settings to grant Open Exam access.
          More information <a target="_blank">here</a>`,
        });
        break;
      case MediaPermissionsErrorType.CouldNotStartVideoSource:
        setModal({
          name: t`Recording Failed`,
          message: message,
        });
        break;
      case MediaPermissionsErrorType.DISMISSED:
        break;
      default:
        setModal({
          name: t`${devices} needs to be enabled`,
          message: t`To start recording your ${
            recordType === "video" ? "video" : "audio"
          }, please allow us to access your ${devices.toLowerCase()} by clicking 'Allow Access' button.
           This will allow your voice to be captured and used as part of your education experience`,
        });
        break;
    }
  };

  const startRecording = async () => {
    if (!documentAllow(DocumentPermission.InteractiveWithTool)) return;

    if (!recorder.current) {
      if (!isGranted) {
        _renderModalContent();
      }

      try {
        // Setup Stream (Get devices)
        recordedChunks.current = [];
        currentStream.current = await requestMediaPermissions({
          video:
            recordType === "video"
              ? {
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  facingMode: "left",
                }
              : false,
          audio: true,
        });
        setPermissions({
          camera:
            recordType === "video"
              ? PermissionType.GRANTED
              : permissions.camera,
          microphone: PermissionType.GRANTED,
        });

        // Setup recorder based on stream
        const options = {
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000,
          mimeType: videoSupportedType.mime,
        };
        recorder.current = new MediaRecorder(currentStream.current, options);
        recorder.current.start(1000);
        recorder.current.onstart = () => {
          setRecordMode(true);
          setRecording(true);
          setModal(null);
        };
        recorder.current.ondataavailable = (dataEvent) => {
          const data = dataEvent.data;
          if (data && data.size > 0) {
            recordedChunks.current.push(data);
          }
        };
      } catch (error) {
        _renderModalContent(error.type, error.message);
      }
    }
  };

  const endRecording = async () => {
    if (!recorder.current) return;
    setUploading(true);
    currentStream.current.getTracks().forEach((track) => track.stop());
    recorder.current.stop();

    const file = new File(recordedChunks.current, attrs.name, {
      type:
        recordType === "video"
          ? videoSupportedType.mime
          : audioSupportedType.mime,
    });

    const uploadResult = await uploadRecordingFile({
      uploadingFile: file,
    });
    if (typeof uploadResult === "string") {
      toast.error(uploadResult);
    } else {
      onChangeAttrs({
        fileId: uploadResult.uuid,
        publicUrl: uploadResult.publicUrl,
        contentType: uploadResult.contentType,
      });
    }
    destroy();
    setRecordMode(false);
    setRecording(false);
    setUploading(false);
    recordedChunks.current = [];
  };

  const pauseRecording = () => {
    if (recorder.current) {
      recorder.current.pause();
      setRecording(false);
    }
  };

  const resumeRecording = () => {
    if (recorder.current) {
      recorder.current.resume();
      setRecording(true);
    }
  };

  const destroy = async () => {
    if (recorder.current) {
      setRecordMode(false);
      recorder.current.stop();
      recorder.current = undefined;
      if (currentStream.current) {
        currentStream.current.getTracks().forEach((track) => track.stop());
        currentStream.current = undefined;
      }
    }
  };

  const deleteRecord = () => {
    destroy();
    handleDelete();
  };

  useEffect(() => {
    setStream(currentStream.current);

    return () => {
      setStream(null);
    };
  }, [currentStream.current]);

  const items: MenuProps["items"] = [];
  if (documentAllow(DocumentPermission.InteractiveWithTool)) {
    items.push({
      key: "1",
      onClick: startRecording,
      label: (
        <Typography.Text>
          <Trans>Replace record</Trans>
        </Typography.Text>
      ),
    });
  }
  if (documentAllow(DocumentPermission.ManageDocument)) {
    items.push({
      key: "2",
      onClick: deleteRecord,
      label: (
        <Typography.Text type="danger">
          <Trans>Delete</Trans>
        </Typography.Text>
      ),
    });
  }

  const isEmpty = !attrs.contentType || recordMode;
  return (
    <RecordBlockContainer
      style={{
        justifyContent:
          recordType === "video" && !recordMode && !!attrs.contentType
            ? "center"
            : "",
        maxWidth: recordType === "video" && !isEmpty ? 850 : "auto",
        margin: "10px auto",
      }}
    >
      {isEmpty && documentAllow(DocumentPermission.InteractiveWithTool) && (
        <>
          {recordMode && stream ? (
            recordType === "audio" ? (
              <RecordingAudioBlock
                endRecording={endRecording}
                pauseRecording={pauseRecording}
                cancelRecord={destroy}
                resumeRecording={resumeRecording}
                uploading={uploading}
                audioStream={stream}
                isRecording={isRecording}
                chunks={recordedChunks.current}
              />
            ) : (
              <RecordingVideoBlock
                endRecording={endRecording}
                cancelRecord={destroy}
                pauseRecording={pauseRecording}
                resumeRecording={resumeRecording}
                uploading={uploading}
                isRecording={isRecording}
                stream={stream}
              />
            )
          ) : (
            <RecordBox onClick={() => startRecording()} isStart={true}>
              <TogglePlay isDenied={!isGranted}>
                {recordType === "audio" ? <RecordAudio /> : <RecordVideo />}
              </TogglePlay>
              <Text
                level={2}
                weight={TextWeight.medium}
                color={!isGranted ? theme.colors.gray[5] : theme.colors.blue[5]}
              >
                {recordType === "audio"
                  ? t`Start audio recording`
                  : t`Start video recording`}
              </Text>
            </RecordBox>
          )}
        </>
      )}
      {attrs.fileId && attrs.contentType && (
        <VideoPlayerWithFileId
          documentId={documentId}
          fileId={attrs.fileId}
          isRecording={recordMode}
          recordType={recordType}
        />
      )}
      {!recordMode && items.length > 0 && (
        <Dropdown menu={{ items }}>
          <TextButtonBlock type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )}
      <Modal
        visible={!!modal?.name}
        onClose={() => setModal(null)}
        title={
          <Space size={14}>
            <ExclamationCircleOutlined style={{ color: theme.colors.red[5] }} />
            <span>{modal?.name}</span>
          </Space>
        }
        centered
      >
        <Text level={3} color={theme.colors.gray[8]}>
          <span dangerouslySetInnerHTML={{ __html: modal?.message }} />
        </Text>
        <Button
          type="primary"
          style={{ float: "right" }}
          customWidth="149px"
          onClick={() => setModal(null)}
        >
          <Trans>OK</Trans>
        </Button>
      </Modal>
    </RecordBlockContainer>
  );
};

export default RecordBlock;
