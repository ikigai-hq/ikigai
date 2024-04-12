import React, { useState } from "react";
import styled from "styled-components";
import { t, Trans } from "@lingui/macro";
import { Button, Typography } from "antd";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { LeftOutlined } from "@ant-design/icons";

import PreviewDocument from "components/PreviewDocument";
import { APPLY_DOCUMENT_TEMPLATE } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import { quickConfirmModal, useModal } from "hook/UseModal";
import useDocumentTemplateStore from "context/ZustandDocumentTemplateStore";
import { TextButtonWithHover } from "components/common/Button";
import AvatarWithName from "../../AvatarWithName";
import TemplateTags from "../TemplateTags";
import EditTemplateModal from "../EditTemplateModal";
import { GetCommunityTemplates_getCommunityDocumentTemplates as IDocumentTemplate } from "graphql/types";
import useUserPermission from "hook/UseUserPermission";
import { Permission } from "../../../util/permission";
import useAuthUserStore from "../../../context/ZustandAuthStore";

export type RightTemplateSideProps = {
  selectedTemplateId?: string;
  onSelectedTemplate: (templateId?: string) => void;
  currentDocumentId?: string,
};

const PreviewTemplate = (
  { selectedTemplateId, onSelectedTemplate, currentDocumentId }: RightTemplateSideProps
) => {
  const { modal } = useModal();
  const [applyDocumentTemplate, { loading }] = useMutation(APPLY_DOCUMENT_TEMPLATE, {
    onError: handleError,
  });
  const allow = useUserPermission();
  const user = useAuthUserStore((state) => state.currentUser);
  const selectedTemplate = useDocumentTemplateStore(state => state.templates.get(selectedTemplateId));
  const addTemplates = useDocumentTemplateStore(state => state.addTemplates);
  const [openEditTemplate, setOpenEditTemplate] = useState(false);
  
  const afterSaveTemplate = (template: IDocumentTemplate) => {
    addTemplates([template]);
    setOpenEditTemplate(false);
  };
  
  const useTemplate = async () => {
    if (!currentDocumentId || !selectedTemplate) return;
    quickConfirmModal(
      modal,
      t`Do you want to apply this template to current document?`,
      async () => {
        const { data } = await applyDocumentTemplate({ variables: {
            originalDocumentId: currentDocumentId,
            templateId: selectedTemplate.id,
          },
        });
        
        if (data) {
          toast.success(t`Successfully!`);
          window.location.reload();
        }
      },
    );
  };
  
  const creator = selectedTemplate?.creator;
  const canEditTemplate = allow(Permission.ManageTemplate) &&
    user?.userMe?.activeOrganization?.id === selectedTemplate?.orgId;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          height: "60px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextButtonWithHover
          type="text"
          icon={<LeftOutlined />}
          onClick={() => onSelectedTemplate(undefined)}
        >
          <Trans>Back to templates</Trans>
        </TextButtonWithHover>
      </div>
      <PreviewContainer>
        <PreviewDocument documentId={selectedTemplate?.documentId} />
      </PreviewContainer>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 16,
          flex: 1,
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography.Title
            level={4}
            style={{ marginTop: "0" }}
            ellipsis
          >
            {selectedTemplate?.name || ""}
          </Typography.Title>
          <div>
            <AvatarWithName
              name={creator ? `${creator.firstName} ${creator.lastName}` : "Unknown"}
              avtUrl={creator?.avatar?.publicUrl}
              color={creator?.randomColor}
              avatarSize={"small"}
            />
          </div>
          <div>
            {
              selectedTemplate &&
              <TemplateTags template={selectedTemplate} editMode={false} />
            }
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {
            selectedTemplate && currentDocumentId &&
            <Button
              type="primary"
              style={{ marginRight: "10px" }}
              disabled={!selectedTemplate || loading}
              loading={loading}
              onClick={useTemplate}
            >
              <Trans>Use template</Trans>
            </Button>
          }
          {
            selectedTemplate && canEditTemplate &&
            <Button
              style={{ marginRight: "10px" }}
              onClick={() => setOpenEditTemplate(true)}
            >
              <Trans>Edit Template</Trans>
            </Button>
          }
        </div>
      </div>
      {
        selectedTemplate && canEditTemplate &&
        <EditTemplateModal
          template={selectedTemplate}
          visible={openEditTemplate}
          onClose={() => setOpenEditTemplate(false)}
          afterSave={afterSaveTemplate}
          afterDelete={() => {
            setOpenEditTemplate(false);
            onSelectedTemplate(undefined);
          }}
        />
      }
    </div>
  );
};

const PreviewContainer = styled.div`
    width: 100%;
    height: calc(100% - 200px);
    border-bottom: 1px solid ${props => props.theme.colors.gray[3]};
`;

export default PreviewTemplate;
