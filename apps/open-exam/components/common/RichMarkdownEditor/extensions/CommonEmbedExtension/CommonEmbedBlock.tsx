import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { LinkPreview } from "@dhaiwat10/react-link-preview";

import { convertToSupportEmbedLink } from "util/Helper";
import { CommonEmbedNodeAttrs } from "./type";

interface Props {
  attrs?: CommonEmbedNodeAttrs;
  onChangeAttrs?: (newAttrs: CommonEmbedNodeAttrs) => void;
  onDelete?: () => void;
}

export const CommonEmbedBlock: React.FC<Props> = ({ attrs }) => {
  const supportEmbedLink = convertToSupportEmbedLink(attrs?.href);

  return (
    <StyledEmbedBlock>
      {supportEmbedLink ? (
        <IframeWrapper>
          <StyledIframe
            width="100%"
            loading="lazy"
            src={supportEmbedLink}
            title="iframe-preview"
            allow="fullscreen"
          />
        </IframeWrapper>
      ) : (
        <StyledLinkPreview
          url={attrs?.href}
          width="100%"
          fallback={
            <Link href={attrs?.href} passHref={true}>
              {attrs?.href}
            </Link>
          }
        />
      )}
    </StyledEmbedBlock>
  );
};

const IframeWrapper = styled.div`
  display: flex;
  margin: 0;
  padding: 0;
  resize: both;
  overflow: hidden;
`;

const StyledEmbedBlock = styled.div`
  padding: 12px;
`;

const StyledIframe = styled.iframe`
  min-height: 500px;
  border: none;
  max-width: 1024px;
  margin: auto;
  resize: unset;
`;

const StyledLinkPreview = styled(LinkPreview)`
  resize: both;
  overflow: auto;
`;
