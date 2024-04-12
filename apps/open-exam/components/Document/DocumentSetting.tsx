/* eslint-disable max-len */
import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import { StyledTitle } from "./common";
import { t, Trans } from "@lingui/macro";
import useDocumentPermission from "hook/UseDocumentPermission";
import { DocumentPermission, DocumentType, getDocumentType, Permission } from "util/permission";
import { useRouter } from "next/router";
import useDocumentStore from "context/ZustandDocumentStore";
import useClassStore from "context/ZustandClassStore";
import styled from "styled-components";
import { BreakPoints } from "styles/mediaQuery";
import { GetDocumentDetail_documentGet as IDocument, OrgRole } from "graphql/types";
import type { MenuProps } from "antd";
import { Dropdown, Popconfirm, Space, Typography } from "antd";
import FileUpload, { DraggerStyled } from "components/common/FileUpload";
import { FileUploadResponse } from "components/common/AddResourceModal";
import AssignmentSettingWrapper from "./AssignmentSetting";
import { Images, PictureIcon, SettingIcon, TrashIcon } from "components/common/IconSvg";
import { Button } from "components/common/Button";
import useAuthUserStore from "context/ZustandAuthStore";
import { useMutation } from "@apollo/client";
import { DELETE_DOCUMENT_PERMANENT, RESTORE_DOCUMENT } from "../../graphql/mutation/DocumentMutation";
import { handleError } from "../../graphql/ApolloClient";
import useUserPermission from "../../hook/UseUserPermission";
import useDocumentTemplateStore from "../../context/ZustandDocumentTemplateStore";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { TEMPLATE } from "../../util/FeatureConstant";

interface DocumentSettingProps {
  isNestedDoc: boolean;
  isReadOnly: boolean;
  document: IDocument;
  isPublishedPage: boolean;
  setIsFocusAtStart: (value: boolean) => void;
}

const DocumentSetting = ({ 
  isNestedDoc, 
  isReadOnly, 
  document, 
  isPublishedPage,
  setIsFocusAtStart }: DocumentSettingProps) => {
  const documentId = document.id;
  const router = useRouter();
  const documentAllow = useDocumentPermission();
  const allow = useUserPermission();
  const updateDocumentLocal = useClassStore((state) => state.updateDocumentTitleLocal);
  const update = useDocumentStore(state => state.update);
  const authUser = useAuthUserStore((state) => state.currentUser);
  const isStudent = authUser?.userMe?.activeOrgMember?.orgRole === OrgRole.STUDENT;
  const currentDocIdQuery = router.query.documentId as string;
  const setOpenTemplateModal = useDocumentTemplateStore(state => state.setChangeOpenTemplateModal);
  const isTemplateEnabled = useFeatureIsOn(TEMPLATE);
  
  const [documentCoverPhoto, setDocumentCoverPhoto] = useState(
    document.coverPhotoUrl
  );
  const [openAssignmentSetting, setOpenAssignmentSetting] = useState(false);
  const [restoreDocument] = useMutation(RESTORE_DOCUMENT, {
    onError: handleError,
  });
  const [deleteDocumentPermanently] = useMutation(DELETE_DOCUMENT_PERMANENT, {
    onError: handleError,
  });

  const handleKeyBoardEvent = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" || event.key === "ArrowDown") {
      event.preventDefault();
      setIsFocusAtStart(true);
    }

    if (event.metaKey && event.key === "s") {
      event.preventDefault();
    }
  };

  const onChangeDocumentTitle = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (currentDocIdQuery !== documentId && !isNestedDoc) return;
    const value = event.target.value;
    updateDocumentLocal(document.id, value);
    update(document.id, { title: value });
  };
  
  const onRestore = async () => {
    if (!document.deletedAt) return;
    
    await restoreDocument({
      variables: {
        documentId: document.id,
      },
    });
    
    router.reload();
  };
  
  const onDeletePermanently = async () => {
    if (!document.deletedAt) return;
    
    await deleteDocumentPermanently({
      variables: {
        documentId: document.id,
      },
    });
    
    router.push("/");
  };

  const isReadOnlyFinal = !documentAllow(DocumentPermission.EditDocument) || isReadOnly;
  
  // Permission check
  const docType = getDocumentType(document);
  const isAssignmentDocument = docType === DocumentType.Assignment;

  const items: MenuProps["items"] = [
    {
      icon: <PictureIcon />,
      label: (
        <>
          <FileUpload
            handleAddFileUuid={(newPhotoCover) => {
              const photoCover = newPhotoCover as FileUploadResponse;
              setDocumentCoverPhoto(photoCover.publicUrl);
              update(document.id, { coverPhotoId: photoCover.uuid });
            }}
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
    {
      icon: <TrashIcon />,
      label: (<Trans>Remove Cover</Trans>),
      danger: true,
      key: "2",
      onClick: () => {
        setDocumentCoverPhoto(null);
        update(document.id, { coverPhotoId: null });
      },
    },
  ];
  
  const showTemplates = allow(Permission.ManageTemplate) &&
    isTemplateEnabled &&
    !isPublishedPage &&
    !isReadOnlyFinal;
  return (
    <>
      {
        document.deletedAt &&
        <div
          style={{
            width: "100%",
            height: "50px",
            background: "#FF4D4F",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex"}}>
            <Typography.Text style={{ color: "white" }}>
              <Trans>
                This document is in the trash.
              </Trans>
            </Typography.Text>
            <Button
              size="small"
              style={{ marginLeft: "5px" }}
              onClick={onRestore}
            >
              <Trans>Restore</Trans>
            </Button>
            <Popconfirm
              title={t`Are you sure want to delete this document permanently?`}
              onConfirm={onDeletePermanently}
            >
              <Button size="small" style={{ marginLeft: "5px" }}>
                <Trans>Delete permanently</Trans>
              </Button>
            </Popconfirm>
          </div>
          <div style={{ flex: 1 }}/>
        </div>
      }
      {
        documentCoverPhoto && (
          <DocumentPhotoCover>
            <img src={documentCoverPhoto} alt="photoCover" />
            <Dropdown
              placement="bottomRight"
              menu={{ items }}
              getPopupContainer={(trigger: any) => trigger.parentNode}
            >
              <EditCoverButton size="large" icon={<PictureIcon />}>
                <Trans>Edit Cover</Trans>
              </EditCoverButton>
            </Dropdown>
          </DocumentPhotoCover>
        )
      }
      <DocumentTitle>
        {!isPublishedPage && !isReadOnlyFinal && documentAllow(DocumentPermission.ManageDocument) && !documentCoverPhoto && (
          <AddCoverButton>
            <FileUpload
              handleAddFileUuid={(newPhotoCover) => {
                const photoCover =
                  newPhotoCover as FileUploadResponse;
                setDocumentCoverPhoto(photoCover.publicUrl);
                update(document.id, { coverPhotoId: photoCover.uuid });
              }}
              acceptType="image/png, image/jpg, image/jpeg"
              isPublic={true}
              multiple={false}
              showProgress={false}
            >
              <Button size="large" type="dashed" icon={<PictureIcon />}>
                <Trans>Add Cover</Trans>
              </Button>
            </FileUpload>
          </AddCoverButton>
        )}
        <StyledTitle
          autoSize
          bordered={false}
          maxLength={255}
          value={document.title}
          onFocus={() => setIsFocusAtStart(false)}
          onKeyDown={handleKeyBoardEvent}
          onChange={onChangeDocumentTitle}
          placeholder={t`Untitled`}
          readOnly={isReadOnlyFinal}
        />
        <Space style={{ marginTop: 10 }}>
          {isAssignmentDocument && !isStudent && !isReadOnlyFinal && (
            <Button
              onClick={() => setOpenAssignmentSetting(true)} 
              className="assignment-settings" 
              size="large" 
              icon={<SettingIcon />} 
              type="text"
            >
              <Trans>Assignment Settings</Trans>
            </Button>
          )}
          {
           showTemplates &&
            <Button
              onClick={() => setOpenTemplateModal(true)}
              size="large"
              icon={<Images />}
              type="text"
            >
              <Trans>Templates</Trans>
            </Button>
          }
        </Space>
      </DocumentTitle>
      <AssignmentSettingWrapper
        open={openAssignmentSetting}
        onClose={() => setOpenAssignmentSetting(false)}
      />
    </>
  );
};

const AddCoverButton = styled(Space)`
  opacity: 0;
  transition: opacity 0.3s;
`;

const DocumentTitle = styled.div<{ $isHighlight?: boolean }>`
  position: ${({ $isHighlight }) => ($isHighlight ? "relative" : "unset")};
  z-index: ${({ $isHighlight }) => ($isHighlight ? 2 : "unset")};
  border: ${(props) =>
    props.$isHighlight
      ? `1px dashed ${props.theme.colors.gray[4]}`
      : "transparent"};
  border-radius: ${({ $isHighlight }) => ($isHighlight ? "4px" : "unset")};
  padding: 20px 48px 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 0px;

  section {
    display: flex;
    width: calc(100% + 30);
    justify-content: space-between;
    margin: 0 -15px;

    button {
      display: flex;
      align-items: center;
      color: ${(props) => props.theme.colors.gray[6]};
      height: 40px;

      svg {
        width: 16px;
      }
    }
  }

  &&& {
    ${DraggerStyled} {
      > div {
        border: none;
      }
    }

    ${Button} {
      height: 34px;
      font-size: 13px;
      font-weight: 500;

      .ant-btn-icon {
        margin-inline-end: 4px;
      }

      svg {
        height: 16px;
      }
    }

    .assignment-settings {
      background: #ECFFF4;
      color: #0D715F;
    }

    &:hover {
      ${AddCoverButton} {
        opacity: 1;
      }
    }
  }

  ${BreakPoints.tablet} {
    padding: 1rem 1.5rem 0rem 1.5rem;
  }
`;

const EditCoverButton = styled(Button)`
  &&& {
    box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px;
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

export default DocumentSetting;
