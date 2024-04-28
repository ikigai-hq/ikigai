import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { secondsToTimestamp } from "util/Time";
import styled from "styled-components";
import { Text, TextWeight } from "components/common/Text";
import { PauseIcon, PlayIcon, VolumeIcon } from "components/common/IconSvg";
import { useTheme } from "styled-components";

export type Props = {
  src: any;
  controls?: boolean;
  contentType?: string;
  maxDurationSeconds?: number;
};

const VideoPlayer = forwardRef<any, Props>((props, ref) => {
  const theme = useTheme();
  const {
    src,
    controls = true,
    contentType = "video/webm",
    maxDurationSeconds,
  } = props;
  const [durationTime, setDurationTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setMuted] = useState(false);
  const videoRef = useRef(null);
  const progressRangeRef = useRef(null);
  const progressBarRef = useRef(null);

  const updateProgress = () => {
    if (progressBarRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setCurrentTime(current);
      if (
        typeof duration === "number" &&
        duration !== Infinity &&
        !Number.isNaN(duration)
      ) {
        setDurationTime(duration);
      }
      progressBarRef.current.style.width = `${
        Math.min(current / duration, 1) * 100
      }%`;
    }
  };

  const setProgress = (e) => {
    const elementRect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - elementRect.left;
    const newTime = offsetX / elementRect.width;
    progressBarRef.current.style.width = `${newTime * 100}%`;
    videoRef.current.currentTime = newTime * durationTime;
  };

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleVolume = () => {
    videoRef.current.muted = !isMuted;
    setMuted(!isMuted);
  };

  useEffect(() => {
    if (src) {
      videoRef.current.addEventListener("loadedmetadata", updateProgress);
      videoRef.current.addEventListener("timeupdate", updateProgress);
      return () => {
        videoRef.current?.removeEventListener("loadedmetadata", updateProgress);
        videoRef.current?.removeEventListener("timeupdate", updateProgress);
      };
    }
  }, [src]);

  useImperativeHandle(ref, () => ({
    videoRef: videoRef.current,
    setDurationTime,
  }));

  return (
    <VideoPlayerBox>
      <video
        ref={videoRef}
        style={{
          height: "520px",
          margin: "0 auto",
          display: "block",
          backgroundColor: "black",
        }}
        playsInline
        onClick={togglePlay}
      >
        <source src={src} type={contentType} />
      </video>
      {controls ? (
        <Controls>
          <ProgressRange
            id="progressRage"
            ref={progressRangeRef}
            onClick={setProgress}
          >
            <ProgressBar id="progressBar" ref={progressBarRef} />
          </ProgressRange>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 12,
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div onClick={togglePlay} style={{ display: "flex" }}>
                {videoRef?.current?.paused === undefined ||
                videoRef?.current?.paused ? (
                  <PlayIcon color={theme.colors.gray[0]} />
                ) : (
                  <PauseIcon color={theme.colors.gray[0]} />
                )}
              </div>
              <VolumeIcon isMuted={isMuted} onClick={handleVolume} />
            </div>
            <Text level={1} color={theme.colors.gray[0]}>
              {secondsToTimestamp(currentTime)} /{" "}
              {secondsToTimestamp(durationTime)}
            </Text>
          </div>
        </Controls>
      ) : (
        <DurationTime
          color={theme.colors.gray[0]}
          level={4}
          weight={TextWeight.medium}
        >
          {secondsToTimestamp(durationTime)}
          {maxDurationSeconds
            ? `/${secondsToTimestamp(maxDurationSeconds)}`
            : ""}
        </DurationTime>
      )}
    </VideoPlayerBox>
  );
});

const VideoPlayerBox = styled.div`
  position: relative;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 12px 15px;
  box-sizing: border-box;

  svg {
    cursor: pointer;
  }
`;

const ProgressRange = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.3);
  height: 2px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;

  &:hover {
    height: 6px;
  }
`;

const ProgressBar = styled.div`
  background: ${(props) => props.theme.colors.gray[0]};
  height: 100%;
  border-radius: 4px;
  cursor: pointer;
  width: 0%;
  transition: all 250ms ease;
  pointer-events: none;
`;

const DurationTime = styled(Text)`
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
`;

export default VideoPlayer;
