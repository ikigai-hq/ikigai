import React, { useEffect, useState } from "react";
import { Enable, Resizable, ResizeCallback, Size as SizeReiszeType } from "re-resizable";
import { Size } from "./type";
import {
  DEFAULT_AUDIO_BLOCK,
  DEFAULT_FILE_BLOCK_HEIGHT,
  DEFAULT_FILE_BLOCK_WIDTH,
  SPACE_BETWEEN_HEADER_BODY,
} from "./utils";

interface Props {
  getResizableDimension: (value: Size) => void;
  initialSize: Size;
  maxWidth?: number;
  disabled?: boolean;
  isAudio?: boolean;
  children?: React.ReactNode;
  isPdf?: boolean;
  resizeParent?: number;
  isFullScreen?: boolean
}

const disabledResize: Enable = {
  top: false,
  right: false,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
};


export const ResizeBox: React.FC<Props> = ({
  children,
  getResizableDimension,
  initialSize,
  disabled,
  isPdf,
  resizeParent,
  isAudio,
  isFullScreen
}) => {
  const [width, setWidth] = useState(initialSize.width);
  const [height, setHeight] = useState(
    disabled ? DEFAULT_AUDIO_BLOCK : initialSize.height
  );
  const aspectRatio = (width && height) ? (width / height) : (16 / 9);

  const handleResizeStop: ResizeCallback = (event, direction, ref, d) => {
    const nWidth = width > resizeParent ? resizeParent : width;
    const nHeight = isPdf ? height : (width > resizeParent ? resizeParent / aspectRatio : height);
    
    const updatedWidth = nWidth + d.width;
    const updatedHeight = nHeight + d.height;

    setWidth(updatedWidth);
    setHeight(updatedHeight);

    // Add callback to get dimension outside.
    getResizableDimension({ width: updatedWidth, height: updatedHeight });
  };

  // AspectRatio = w / h
  // When set aspect ratio, ratio between width and height always equal aspect ratio we defined.
  // Ratio between min-width and min-height need to same as aspect ratio we defined.
  useEffect(() => {
    setWidth(initialSize.width);
    setHeight(initialSize.height);
  }, [initialSize]);

  const getSize = (): SizeReiszeType => {
    const isOverSize = width > resizeParent;
    if (isFullScreen) {
      return {
        width: 'calc(100vw - 20px)',
        height: 'calc(100vh - 20px)'
      };
    } 
    return {
      width: isAudio ? '100%' : (isOverSize ? resizeParent : width),
      height: isAudio ? '100%' : (isPdf ? height : (isOverSize ? resizeParent / aspectRatio : height)) 
    };
  };

  return (
    <Resizable
      // lockAspectRatio={aspectRatio}
      lockAspectRatio={isPdf ? null : aspectRatio}
      enable={disabled ? disabledResize : undefined}
      minWidth={20}
      minHeight={20}
      size={getSize()}
      maxWidth="100%"
      onResizeStop={handleResizeStop}
      onResize={(event, direction, ref, d) => {
        const pdfBodyEl = ref.getElementsByClassName(
          "pdf-body-container"
        )[0] as HTMLDivElement;

        if (pdfBodyEl) {
          const hRatio = ref.offsetHeight / pdfBodyEl.offsetHeight;
          pdfBodyEl.style.height = `${pdfBodyEl.offsetHeight * hRatio - SPACE_BETWEEN_HEADER_BODY - 48
            }px`;
        }
      }}
    >
      {children}
    </Resizable>
  );
};
