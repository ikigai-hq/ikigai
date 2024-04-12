import videojs from "video.js";
import { useEffect, useRef } from "react";

interface IVideoPlayerProps {
  options: videojs.PlayerOptions;
  paddingTop?: number;
}

const initialOptions: videojs.PlayerOptions = {
  controls: true,
  fluid: true,
};

const VideoPlayer = ({ options, paddingTop }: IVideoPlayerProps) => {
  const videoNode = useRef<HTMLVideoElement>();
  const player = useRef<videojs.Player>();

  useEffect(() => {
    player.current = videojs(videoNode.current, {
      ...initialOptions,
      ...options,
    });

    return () => {
      if (player.current) {
        player.current.dispose();
      }
    };
  }, []);

  return (
    <div data-vjs-player style={{ paddingTop: paddingTop ? `${paddingTop}%` : 'none', width: '100%', height: '100%' }}>
      <video ref={videoNode} className="video-js" />
    </div>
  );
};

export default VideoPlayer;
