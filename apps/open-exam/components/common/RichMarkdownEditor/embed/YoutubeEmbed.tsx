import React from "react";
import styled from "styled-components";

interface Props {
  isSelected: boolean;
  attrs: { [key: string]: any };
}

export const YoutubeEmbed: React.FC<Props> = ({ isSelected, attrs }) => {
  const videoId = attrs.matches[1];

  return (
    <IframeWrapper>
      <iframe
        width="100%"
        height={500}
        className={isSelected ? "ProseMirror-selectednode" : ""}
        src={`https://www.youtube.com/embed/${videoId}?modestbranding=1`}
      />
    </IframeWrapper>
  );
};

export const IframeWrapper = styled.div`
  display: flex;
  margin: 0;
  padding: 0;
  resize: both;
  overflow: hidden;
`;
