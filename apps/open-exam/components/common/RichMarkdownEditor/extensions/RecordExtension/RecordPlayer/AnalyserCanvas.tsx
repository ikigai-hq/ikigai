import { useEffect, useRef } from "react";

export type Props = {
  audioStream: any;
};

const AnalyserCanvas = ({ audioStream }: Props) => {
  const requestRef = useRef(null);
  const analyserCanvas = useRef(null);
  const refContainter = useRef(null);

  useEffect(() => {
    // Turn media stream from the microphone into a source for the Web Audio
    const audioContext = new window.AudioContext();
    const analyser = audioContext.createAnalyser();
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);

    const loopRequestAnimationFrame = () => {
      analyser.getByteTimeDomainData(dataArray);
      draw(dataArray);
      requestRef.current = requestAnimationFrame(loopRequestAnimationFrame);
    };

    requestRef.current = requestAnimationFrame(loopRequestAnimationFrame);

    return () => {
      cancelAnimationFrame(requestRef.current);
      analyser.disconnect();
      source.disconnect();
    };
  }, []);

  // Draw microphone wave
  const draw = (data: any) => {
    if (!analyserCanvas.current) return;
    const canvas = analyserCanvas.current;
    const height = canvas.height;
    const width = canvas.width;
    const context = canvas.getContext("2d");
    let x = 0;
    const sliceWidth = (width * 1.0) / data.length;

    context.lineWidth = 2;
    context.strokeStyle = "#FA541C";
    context.clearRect(0, 0, width, height);

    context.beginPath();
    context.moveTo(0, height / 2);
    for (const item of data) {
      const y = (item / 255.0) * height;
      context.lineTo(x, y);
      x += sliceWidth;
    }
    context.lineTo(x, height / 2);
    context.stroke();
  };

  return (
    <div
      ref={refContainter}
      style={{
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        width={refContainter?.current?.offsetWidth}
        height="100"
        ref={analyserCanvas}
        style={{
          position: "absolute",
          pointerEvents: "none",
          opacity: refContainter?.current ? 1 : 0,
        }}
      />
    </div>
  );
};

export default AnalyserCanvas;
