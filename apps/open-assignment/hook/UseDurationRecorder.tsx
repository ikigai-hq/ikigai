import { useStopwatch } from "react-timer-hook";
import { useEffect } from "react";

const useDurationRecorder = (isRecording: boolean) => {
  const { start, pause, seconds, minutes, hours } = useStopwatch();

  useEffect(() => {
    if (isRecording) {
      start();
    } else {
      pause();
    }
  }, [isRecording]);

  return seconds + minutes * 60 + hours * 3600;
};

export default useDurationRecorder;
