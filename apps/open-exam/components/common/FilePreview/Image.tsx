/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FileItem } from "util/FileUtil";

interface Props {
  fileItem: FileItem;
  isFullScreen?: boolean;
  handleFullScreen?: (isOpen: boolean) => void;
  handleZoom?: (zooom: number) => void;
  downloadUrl: string;
  zoom?: number;
}

const ImagePreview: React.FC<Props> = (props) => {
  const {
    fileItem,
    isFullScreen,
    downloadUrl,
    zoom,
    handleFullScreen,
    handleZoom,
  } = props;
  const { fileId } = fileItem;

  // Image
  const imageRef = useRef(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [imageAttrs, setimageAttrs] = useState({
    x: 0,
    y: 0,
    width: "",
    height: "",
  });
  const [isMouseDown, setisMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (imageRef.current && isFullScreen) {
      const ratio =
        imageRef.current.naturalWidth / imageRef.current.naturalHeight;
      const isHorizontal = window.innerHeight * ratio > window.innerWidth;
      setimageAttrs({
        x:
          ((isHorizontal ? window.innerWidth : window.innerHeight * ratio) * 2 -
            window.innerWidth) /
          4,
        y:
          ((isHorizontal ? window.innerWidth / ratio : window.innerHeight) * 2 -
            window.innerHeight) /
          4,
        width: isHorizontal ? "100%" : "auto",
        height: isHorizontal ? "auto" : "100%",
      });
    }
  }, [isFullScreen]);

  useEffect(() => {
    if (zoom === 1) {
      setOffsetX(0);
      setOffsetY(0);
    }
  }, [isFullScreen, zoom]);

  const handleClick = (e) => {
    if (isFullScreen) {
      if (zoom === 2) {
        handleZoom(-(zoom - 1));
      } else {
        handleZoom(0.5);
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleMoveImage(-x + rect.width / 2, -y + rect.height / 2, true);
      }
    } else {
      handleFullScreen(true);
    }
  };

  const handleMoveImage = (deltaX, deltaY, isForce = false) => {
    if (zoom > 1 || isForce) {
      setOffsetX((prevX) => {
        if (prevX + deltaX >= 0)
          return Math.min(prevX + deltaX, Math.abs(imageAttrs.x));
        return Math.max(prevX + deltaX, -Math.abs(imageAttrs.x));
      });
      setOffsetY((prevY) => {
        if (prevY + deltaY >= 0)
          return Math.min(prevY + deltaY, Math.abs(imageAttrs.y));
        return Math.max(prevY + deltaY, -Math.abs(imageAttrs.y));
      });
    }
  };

  const handleMouseDown = (e) => {
    const timer = setTimeout(() => {
      setisMouseDown(true);
      setStartX(e.clientX);
      setStartY(e.clientY);
    }, 200);
    setTimer(timer);
  };

  const handleMouseUp = (e) => {
    if (isMouseDown) {
      setisMouseDown(false);
    } else {
      handleClick(e);
    }
    clearTimeout(timer);
  };

  const handleMouseMove = (e) => {
    if (isMouseDown) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      handleMoveImage(deltaX, deltaY);
      setStartX(e.clientX);
      setStartY(e.clientY);
    }
  };

  return (
    <ImagePreviewWrapper
      $isFullScreen={isFullScreen}
      onClick={() => handleFullScreen(false)}
    >
      <MaskImage
        $zoom={zoom}
        $offsetX={offsetX}
        $offsetY={offsetY}
        $isFullScreen={isFullScreen}
        $imageAttrs={imageAttrs}
        onWheel={(e) => handleMoveImage(-e.deltaX, -e.deltaY)}
      >
        <img
          draggable={false}
          src={downloadUrl}
          alt={fileId}
          ref={imageRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setisMouseDown(false)}
          onClick={(e) => e.stopPropagation()}
        />
      </MaskImage>
    </ImagePreviewWrapper>
  );
};

const ImagePreviewWrapper = styled.div<{ $isFullScreen: boolean }>`
  width: ${(props) => (props.$isFullScreen ? "100vw" : "auto")};
  height: 100%;
  position: ${(props) => (props.$isFullScreen ? "fixed" : "unset")};
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MaskImage = styled.div<{
  $zoom: number;
  $offsetX: number;
  $offsetY: number;
  $isFullScreen: boolean;
  $imageAttrs: any;
}>`
  height: 100%;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
  transform: ${(props) =>
    `scale(${props.$zoom}) translateX(${props.$offsetX}px) translateY(${props.$offsetY}px)`};
  transition-property: opacity, transform;
  transition-duration: 270ms;
  transition-timing-function: ease;

  img {
    object-fit: contain;
    cursor: ${(props) =>
      props.$isFullScreen
        ? props.$zoom === 2
          ? "zoom-out"
          : "zoom-in"
        : "pointer"};
    position: ${(props) => (props.$isFullScreen ? "absolute" : "unset")};
    top: 50%;
    left: 50%;
    transform: ${(props) =>
      props.$isFullScreen ? "translateX(-50%) translateY(-50%)" : "unset"};
    height: ${(props) =>
      props.$isFullScreen ? props.$imageAttrs.height : "100%"};
    width: ${(props) =>
      props.$isFullScreen ? props.$imageAttrs.width : "auto"};
  }
`;

export default ImagePreview;
