import styled from "styled-components";
import { Trans } from "@lingui/macro";
import React from "react";
import Image from "next/image";

import { Button } from "components/common/Button";
import FileUpload, { DraggerStyled } from "components/common/FileUpload";
import { PictureIcon, TrashIcon } from "components/common/IconSvg";
import useDocumentStore from "context/DocumentV2Store";
import { Dropdown, MenuProps } from "antd";
import { FileUploadResponse } from "components/common/AddResourceModal";
import useUpdateDocument from "hook/UseUpdateDocument";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";

const CoverPhotoHeader = () => {
  const allow = usePermission();
  const updateActiveDocumentServer = useUpdateDocument();
  const coverPhotoUrl = useDocumentStore(
    (state) => state.activeDocument?.coverPhotoUrl,
  );
  const updateActiveDocument = useDocumentStore(
    (state) => state.updateActiveDocument,
  );

  const handleAddFileUuid = (photoCover: FileUploadResponse) => {
    updateActiveDocumentServer({ coverPhotoId: photoCover.uuid });
    updateActiveDocument({
      coverPhotoUrl: photoCover.publicUrl,
      coverPhotoId: photoCover.uuid,
    });
  };

  const items: MenuProps["items"] = [
    {
      icon: <PictureIcon />,
      label: (
        <>
          <FileUpload
            handleAddFileUuid={handleAddFileUuid}
            acceptType="image/png, image/jpg, image/jpeg"
            isPublic={true}
            multiple={false}
            showProgress={false}
          >
            <Trans>Upload Cover</Trans>
          </FileUpload>
        </>
      ),
      key: "0",
    },
  ];
  const deleteItem = {
    icon: <TrashIcon />,
    label: <Trans>Remove Cover</Trans>,
    danger: true,
    key: "2",
    onClick: () => {
      updateActiveDocumentServer({ coverPhotoId: null });
      updateActiveDocument({
        coverPhotoUrl: null,
        coverPhotoId: null,
      });
    },
  };

  return (
    <Container>
      {coverPhotoUrl && (
        <DocumentPhotoCover>
          <Image
            style={{ objectFit: "contain" }}
            src={coverPhotoUrl}
            alt="photoCover"
            layout="fill"
          />
          {allow(DocumentActionPermission.EDIT_DOCUMENT) && (
            <Dropdown
              placement="bottomRight"
              menu={{ items: [...items, deleteItem] }}
              getPopupContainer={(trigger: any) => trigger.parentNode}
            >
              <EditCoverButton size="large" icon={<PictureIcon />}>
                <Trans>Edit Cover</Trans>
              </EditCoverButton>
            </Dropdown>
          )}
        </DocumentPhotoCover>
      )}
      {!coverPhotoUrl && (
        <FileUpload
          handleAddFileUuid={handleAddFileUuid}
          acceptType="image/png, image/jpg, image/jpeg"
          isPublic={true}
          multiple={false}
          showProgress={false}
          disableDrag
        >
          <AddCoverButton size="large" icon={<PictureIcon />}>
            <Trans>Add Cover</Trans>
          </AddCoverButton>
        </FileUpload>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
`;

const AddCoverButton = styled(Button)`
  &&& {
    margin-top: 20px;
    margin-left: 20px;
    box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px,
      rgba(15, 15, 15, 0.1) 0px 2px 4px;
    height: 34px;
    border: none;
    font-size: 13px;
    font-weight: 500;
    transition: opacity 0.3s;

    .ant-btn-icon {
      margin-inline-end: 0px;
    }
  }
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

export default CoverPhotoHeader;
