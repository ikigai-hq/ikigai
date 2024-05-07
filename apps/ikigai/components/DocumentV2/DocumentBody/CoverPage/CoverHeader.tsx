import styled from "styled-components";
import { Trans } from "@lingui/macro";
import React from "react";

import { Button } from "components/common/Button";
import { DraggerStyled } from "components/common/FileUpload";
import { PictureIcon } from "components/common/IconSvg";
import useDocumentStore from "context/DocumentV2Store";

const CoverHeader = () => {
  const activeDocument = useDocumentStore((state) => state.activeDocument);

  return (
    <Container>
      <DocumentPhotoCover>
        {activeDocument.coverPhotoUrl && (
          <img src={activeDocument.coverPhotoUrl} alt="photoCover" />
        )}
        <EditCoverButton size="large" icon={<PictureIcon />}>
          <Trans>Edit Cover</Trans>
        </EditCoverButton>
      </DocumentPhotoCover>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  min-height: 50px;
`;

const EditCoverButton = styled(Button)`
  &&& {
    box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px,
      rgba(15, 15, 15, 0.1) 0px 2px 4px;
    height: 34px;
    position: absolute;
    bottom: 16px;
    right: 16px;
    border: none;
    opacity: 0;
    font-size: 13px;
    font-weight: 500;
    transition: opacity 0.3s;

    .ant-btn-icon {
      margin-inline-end: 0px;
    }
  }
`;

const DocumentPhotoCover = styled.div`
  display: grid;
  width: 100%;
  height: 30vh;
  background-color: ${(props) => props.theme.colors.primary[5]};
  position: relative;
  cursor: pointer;

  img {
    display: block;
    object-fit: cover;
    border-radius: 0px;
    width: 100%;
    height: 30vh;
    opacity: 1;
    object-position: center 50%;
  }

  &&& {
    span {
      font-size: 13px;
      font-weight: 500;
    }

    svg {
      height: 16px;
      margin-inline-end: 4px;
    }

    &:hover {
      ${EditCoverButton} {
        opacity: 1;
      }
    }

    ${DraggerStyled} {
      div {
        border: none;
        align-items: self-start;
      }
    }
  }
`;

export default CoverHeader;
