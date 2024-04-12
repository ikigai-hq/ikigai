import { Text } from "components/common/Text";
import { forwardRef, useEffect, useRef, useState } from "react";
import { secondsToTimestamp } from "util/Time";
import WaveSurfer from "wavesurfer.js";
import { TogglePlay } from "../recordStyles";
import { PauseIcon, PlayIcon } from "components/common/IconSvg";
import useDocumentStore from "context/ZustandDocumentStore";
import { useTheme } from "styled-components";
import { useLazyQuery } from "@apollo/client";
import { GET_AUDIO_WAVEFORM } from "graphql/query";
import { handleError } from "graphql/ApolloClient";
import { GetAudioWaveform } from "graphql/types";
import { cloneDeep } from "lodash";

interface ChildComponentProps {
  fileId?: string;
  src: string;
  contentType: string;
  isRecordingBlock?: boolean;
  recording?: boolean;
  onlyWave?: boolean;
  syncData?: (data: any) => void;
  replay?: boolean;
}

const AudioPlayer = forwardRef<any, ChildComponentProps>((props) => {
  const theme = useTheme();
  const {
    src,
    recording,
    onlyWave,
    syncData,
    contentType,
    isRecordingBlock,
    replay,
  } = props;
  const isClose = useDocumentStore((state) => state.isClose);
  const masterDocumentId = useDocumentStore((state) => state.masterDocumentId);
  const [fetchWaveform] = useLazyQuery<GetAudioWaveform>(GET_AUDIO_WAVEFORM, {
    onError: handleError,
  });

  // WaveSurfer
  const [isPlaying, toggleIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const containerRef = useRef();
  const audioRef = useRef<any>(null);

  useEffect(() => {
    if ((isClose || recording) && audioRef.current && isPlaying) {
      try {
        audioRef.current?.playPause();
      } catch (e) {
        console.error("Pause audio problem", e);
      }
    }
  }, [isClose, recording]);

  const updatePlayTime = () => {
    const duration = audioRef.current.getDuration();
    const current = audioRef.current.getCurrentTime();
    audioRef.current.key = current;
    setPlayTime(duration - current);
  };

  // Init Wavesurfer
  useEffect(() => {
    handleSrc(src);
  }, [src]);

  const handleSrc = async (src: string) => {
    if (src) {
      try {
        let peaks: number[] = [1, 1];
        if (props.fileId && masterDocumentId) {
          const { data } = await fetchWaveform({
            variables: {
              documentId: masterDocumentId,
              fileId: props.fileId,
            },
          });

          if (data && data.fileWaveform) {
            const parsedData = JSON.parse(cloneDeep(data.fileWaveform));
            peaks = parsedData?.data;
          }
        }
        const shouldSetBackend =
          isRecordingBlock && contentType !== "audio/mp4";
        const config: any = {
          waveColor: "#AFB4BE",
          progressColor: "#FA541C",
          barRadius: 2,
          height: onlyWave ? 60 : 40,
          cursorWidth: 0,
          barWidth: 2,
          barMinHeight: 1,
          normalize: true,
          responsive: true,
          fillParent: true,
          container: containerRef.current,
          hideScrollbar: true,
          interact: replay,
        };
        if (!shouldSetBackend) config.backend = "MediaElement";
        const waveSurfer = WaveSurfer.create(config);
        waveSurfer.load(src, peaks);
        waveSurfer.on("ready", () => {
          audioRef.current = waveSurfer;
          setPlayTime(audioRef.current.getDuration());
          if (syncData) syncData(waveSurfer);
        });
        if (!onlyWave) {
          waveSurfer.on("audioprocess", updatePlayTime);
          waveSurfer.on("seek", updatePlayTime);
        }
        return () => {
          waveSurfer.destroy();
        };
      } catch (e) {
        console.error("Cannot init wave suffer", e);
      }
    }
  };

  const handleTogglePlay = () => {
    audioRef.current?.playPause();
    toggleIsPlaying(audioRef.current.isPlaying());
  };

  return (
    <div
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8 }}
    >
      {!onlyWave && (
        <TogglePlay onClick={() => handleTogglePlay()}>
          {isPlaying ? (
            <PauseIcon color="#ffffff" />
          ) : (
            <PlayIcon color="#ffffff" style={{ marginLeft: 2 }} />
          )}
        </TogglePlay>
      )}
      <div style={{ width: "100%" }} ref={containerRef} />
      {!onlyWave && (
        <Text
          color={theme.colors.gray[8]}
          level={1}
          style={{ display: "block", wordBreak: "keep-all" }}
        >
          {secondsToTimestamp(playTime)}
        </Text>
      )}
    </div>
  );
});

export default AudioPlayer;
