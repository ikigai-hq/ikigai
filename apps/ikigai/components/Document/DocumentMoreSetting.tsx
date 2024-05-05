import { t, Trans } from "@lingui/macro";
import { Space } from "antd";
import { useRouter } from "next/router";
import React from "react";
import styled, { useTheme } from "styled-components";
import toast from "react-hot-toast";
import { ExclamationCircleFilled } from "@ant-design/icons";

import { Button } from "components/common/Button";
import {
  CopyIcon,
  DeleteIcon,
  StandardIcon,
  WideIcon,
} from "components/common/IconSvg";
import { Text, TextWeight } from "components/common/Text";
import useDocumentStore, {
  EditorConfigType,
} from "context/ZustandDocumentStore";
import { quickConfirmModal, useModal } from "hook/UseModal";
import useSpaceStore from "context/ZustandSpaceStore";
import { formatDocumentRoute } from "config/Routes";
import { formatDate, FormatType } from "util/Time";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";

const DocumentMoreSetting = () => {
  const theme = useTheme();
  const { modal } = useModal();
  const router = useRouter();

  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const allow = usePermission();

  const editorConfig = {
    size: activeDocument.editorConfig.size || EditorConfigType.DEFAULT,
    style: activeDocument.editorConfig.style || EditorConfigType.DEFAULT,
    width: activeDocument.editorConfig.width || EditorConfigType.WIDTH_STANDARD,
  };

  const getActiveConfig = (config: string, type: string) => {
    return editorConfig[type] === config;
  };

  const { duplicateDocument, deleteDocument, docs } = useSpaceStore((state) => {
    return {
      duplicateDocument: state.duplicateDocument,
      deleteDocument: state.deleteDocument,
      docs: state.documents,
    };
  });

  const onDuplicate = () => {
    quickConfirmModal(
      modal,
      t`Do you want to duplicate this document?`,
      async () => {
        const res = await duplicateDocument(activeDocument.id);
        if (res) {
          toast.success(t`Duplicated!`);
        }
      },
    );
  };

  const onDelete = () => {
    modal.confirm({
      zIndex: 1100,
      title: t`Are you sure you want to delete this ?`,
      icon: <ExclamationCircleFilled />,
      content: t`This action cannot be undone. Once you delete this, 
        you will lose all the content and settings associated with it.`,
      okText: `Yes, delete this`,
      okType: "danger",
      cancelText: t`Cancel`,
      onOk: async () => {
        const res = await deleteDocument(activeDocument.id);
        if (res) {
          toast.success(t`Delete content successfully!`);
          // This document was deleted
          if (res.includes(activeDocument.id)) {
            // Found the first non deleted one
            const otherDoc = [...docs]
              .sort((a, b) => a.index - b.index)
              .find(
                (doc) =>
                  !doc.deletedAt &&
                  !doc.parentId &&
                  doc.id !== activeDocument.id,
              );
            if (otherDoc) {
              return router.push(formatDocumentRoute(otherDoc.id), undefined, {
                shallow: true,
              });
            }

            return router.push("/");
          }
        }
        return toast.success(t`Try again!`);
      },
      okButtonProps: {
        type: "primary",
      },
      bodyStyle: {
        padding: "32px 32px 24px 32px",
      },
    });
  };

  const onUpdateDocumentConfig = (editorConfig: any) => {
    useDocumentStore
      .getState()
      .update(
        activeDocument.id,
        { editorConfig: { ...activeDocument.editorConfig, ...editorConfig } },
        !allow(DocumentActionPermission.MANAGE_DOCUMENT),
      );
  };

  return (
    <DocumentMoreSettingContainer>
      <SettingContainer $noBorder>
        <Text weight={TextWeight.bold} level={2}>
          <Trans>Style</Trans>
        </Text>
        <Space.Compact block style={{ justifyContent: "space-between" }}>
          <StyleButton
            $font="Inter"
            $active={getActiveConfig(EditorConfigType.DEFAULT, "style")}
            onClick={() =>
              onUpdateDocumentConfig({ style: EditorConfigType.DEFAULT })
            }
          >
            <Text level={7}>Aa</Text>
            <Text level={1} weight={TextWeight.medium}>
              <Trans>Default</Trans>
            </Text>
          </StyleButton>
          <StyleButton
            $font="Roboto Serif"
            $active={getActiveConfig(EditorConfigType.STYLE_SERIF, "style")}
            onClick={() =>
              onUpdateDocumentConfig({ style: EditorConfigType.STYLE_SERIF })
            }
          >
            <Text level={7}>Aa</Text>
            <Text level={1} weight={TextWeight.medium}>
              <Trans>Serif</Trans>
            </Text>
          </StyleButton>
          <StyleButton
            $font="Roboto Mono"
            $active={getActiveConfig(EditorConfigType.STYLE_MONO, "style")}
            onClick={() =>
              onUpdateDocumentConfig({ style: EditorConfigType.STYLE_MONO })
            }
          >
            <Text level={7}>Aa</Text>
            <Text level={1} weight={TextWeight.medium}>
              <Trans>Mono</Trans>
            </Text>
          </StyleButton>
        </Space.Compact>
      </SettingContainer>
      <SettingContainer $noBorder>
        <Text weight={TextWeight.bold} level={2}>
          <Trans>Size</Trans>
        </Text>
        <GroupButton>
          <StyleButton
            $active={getActiveConfig(EditorConfigType.DEFAULT, "size")}
            onClick={() =>
              onUpdateDocumentConfig({ size: EditorConfigType.DEFAULT })
            }
          >
            <SettingButton>
              <Trans>{EditorConfigType.DEFAULT}</Trans>
            </SettingButton>
          </StyleButton>
          <StyleButton
            $active={getActiveConfig(EditorConfigType.SIZE_LARGE, "size")}
            onClick={() =>
              onUpdateDocumentConfig({ size: EditorConfigType.SIZE_LARGE })
            }
          >
            <SettingButton>
              <Trans>{EditorConfigType.SIZE_LARGE}</Trans>
            </SettingButton>
          </StyleButton>
        </GroupButton>
      </SettingContainer>
      <SettingContainer $noBorder>
        <Text weight={TextWeight.bold} level={2}>
          <Trans>Width</Trans>
        </Text>
        <GroupButton>
          <StyleButton
            $active={getActiveConfig(EditorConfigType.WIDTH_STANDARD, "width")}
            onClick={() =>
              onUpdateDocumentConfig({ width: EditorConfigType.WIDTH_STANDARD })
            }
          >
            <SettingButton $size="large">
              <StandardIcon />
            </SettingButton>
            <Text level={1} weight={TextWeight.medium}>
              <Trans>{EditorConfigType.WIDTH_STANDARD}</Trans>
            </Text>
          </StyleButton>
          <StyleButton
            $active={getActiveConfig(EditorConfigType.WIDTH_WIDE, "width")}
            onClick={() =>
              onUpdateDocumentConfig({ width: EditorConfigType.WIDTH_WIDE })
            }
          >
            <SettingButton $size="large">
              <WideIcon />
            </SettingButton>
            <Text level={1} weight={TextWeight.medium}>
              <Trans>{EditorConfigType.WIDTH_WIDE}</Trans>
            </Text>
          </StyleButton>
        </GroupButton>
      </SettingContainer>
      <div>
        {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
          <>
            <SettingContainer $gap={0} $padding="8px 0">
              <SettingButton
                type="text"
                icon={<CopyIcon />}
                onClick={onDuplicate}
              >
                <Trans>Duplicate</Trans>
              </SettingButton>
              <SettingButton
                danger
                type="text"
                icon={<DeleteIcon style={{ color: theme.colors.red[4] }} />}
                onClick={onDelete}
              >
                <Trans>Delete</Trans>
              </SettingButton>
            </SettingContainer>
          </>
        )}
        <SettingContainer $padding="12px 0 0 0">
          <Text
            level={1}
            color={theme.colors.gray[6]}
            weight={TextWeight.medium}
          >
            Last edited at{" "}
            {formatDate(activeDocument.updatedAt, FormatType.UpdatedType)}
          </Text>
        </SettingContainer>
      </div>
    </DocumentMoreSettingContainer>
  );
};

const DocumentMoreSettingContainer = styled.div`
  min-width: 300px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 20px;
  max-height: calc(100vh - 63px);
  overflow: auto;
  margin: -12px;
  padding: 12px;
`;

const SettingContainer = styled.div<{
  $gap?: number;
  $padding?: string;
  $noBorder?: boolean;
}>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${(props) => `${props.$gap >= 0 ? props.$gap : 8}px`};
  padding: ${(props) => props.$padding};
  box-sizing: border-box;

  ${(props) =>
    !props.$noBorder && `border-top: 1px solid ${props.theme.colors.gray[3]};`}
`;

const SettingButton = styled(Button)<{ $size?: string }>`
  justify-content: flex-start;

  &&& {
    font-weight: 500;
    width: 100%;
    border-radius: 8px;
    padding: ${(props) => (props.$size === "large" ? "15px" : "8px")};

    ${(props) =>
      props.$size !== "large" &&
      `
      svg {
        width: 16px;
        margin-right: 8px;
        color: ${props.theme.colors.gray[7]};
      }
    `}
  }
`;

const StyleButton = styled.div<{ $font?: string; $active?: boolean }>`
  display: flex;
  flex-direction: column;
  font-family: ${(props) => props.$font};
  cursor: pointer;
  text-align: center;
  gap: 4px;

  * {
    color: ${(props) =>
      props.$active
        ? props.theme.colors.primary[5]
        : props.theme.colors.gray[5]};
  }

  &:hover {
    * {
      color: ${(props) => props.theme.colors.primary[5]};
    }
  }

  ${SettingButton} {
    border-color: ${(props) =>
      props.$active
        ? props.theme.colors.primary[5]
        : props.theme.colors.gray[4]};
  }
`;

const GroupButton = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 9px;

  &&& {
    button {
      justify-content: center;
    }
  }
`;

export default DocumentMoreSetting;
