import { encode } from "urlencode";
import styled from "styled-components";

const StyledIframe = styled.iframe``;

export type OfficeFileViewerProps = {
  url: string;
  isFullScreen: boolean;
  height: string;
};

const OfficeFileViewer = ({
  url,
  isFullScreen,
  height,
}: OfficeFileViewerProps) => {
  const encodedUrl = encode(url);

  return (
    <StyledIframe
      id={encodedUrl}
      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`}
      width="100%"
      height="100%"
      frameBorder="0"
      title="slides"
    />
  );
};

export default OfficeFileViewer;
