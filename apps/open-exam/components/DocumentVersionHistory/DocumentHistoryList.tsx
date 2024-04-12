import { useMutation, useQuery } from "@apollo/client";
import styled from "styled-components";
import { t } from "@lingui/macro";
import { Button, Tooltip, Typography } from "antd";
import toast from "react-hot-toast";
import { EditOutlined } from "@ant-design/icons";
import { cloneDeep } from "lodash";
import { MouseEvent, useState } from "react";

import { handleError } from "graphql/ApolloClient";
import { GET_DOCUMENT_HISTORY_VERSIONS } from "graphql/query/DocumentQuery";
import Loading from "components/Loading";
import {
  GetDocumentHistoryVersions,
  GetDocumentHistoryVersions_documentGetHistoryVersions as IDocumentVersion,
} from "graphql/types";
import { FormatType, formatDate } from "util/Time";
import { RESTORE_DOCUMENT_VERSION } from "graphql/mutation/DocumentMutation";
import { quickConfirmModal, useModal } from "hook/UseModal";
import { TextButtonWithHover } from "components/common/Button";
import EditVersionModal from "./EditVersionModal";

export type DocumentHistoryListProps = {
  documentId: number;
  selectedVersion?: IDocumentVersion;
  onSelectVersion: (version: IDocumentVersion) => void;
  onCancel: () => void;
};

const DocumentHistoryList = (
  { documentId, onSelectVersion, selectedVersion, onCancel }: DocumentHistoryListProps
) => {
  const { modal } = useModal();
  const [versions, setVersions] = useState<IDocumentVersion[]>([]);
  const [restoreDocument, { loading: loadingRestore }] = useMutation(RESTORE_DOCUMENT_VERSION, {
    onError: handleError,
  });
  const [editingVersion, setEditingVersion] = useState<IDocumentVersion | undefined>();
  const { loading } = useQuery<GetDocumentHistoryVersions>(GET_DOCUMENT_HISTORY_VERSIONS, {
    onError: handleError,
    variables: {
      documentId,
    },
    fetchPolicy: "network-only",
    onCompleted: (data) =>
      setVersions(cloneDeep(data.documentGetHistoryVersions).sort((a, b) => b.createdAt - a.createdAt)),
  });

  const onRestoreDocument = async () => {
    if (!selectedVersion) return;
    quickConfirmModal(
      modal,
      t`Do you want to restore this version?`,
      async () => {
        const { data } = await toast.promise(
          restoreDocument({
            variables: {
              versionId: selectedVersion.id
            }
          }),
          {
            success: t`Restored!`,
            error: t`Failed to restore`,
            loading: t`Restoring`,
          },
        );
        if (data) window.location.reload();
      },
    );
  };

  const onClickChangeVersionName = (version: IDocumentVersion) => (e: MouseEvent) => {
    e.stopPropagation();
    setEditingVersion(version);
  };

  const getCreatorName = (version: IDocumentVersion) =>
    version.createdBy ? `${version.createdBy.firstName} ${version.createdBy.lastName}` : t`Unknown`;

  if (loading) return (
    <LeftSideContainer>
      <Loading />
    </LeftSideContainer>
  );

  return (
    <LeftSideContainer>
      <div 
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {
          versions.map(version => (
            <VersionContainer
              key={version.id}
              $selected={selectedVersion?.id === version.id}
              onClick={() => onSelectVersion(version)}
            >
              <div style={{ display: "flex" }}>
                <Typography.Text ellipsis style={{ flex: 1 }}>
                  {version.name} 
                </Typography.Text>
                <Tooltip
                  title={t`Edit name`}
                  arrow={false}
                  placement="bottom"
                >
                  <TextButtonWithHover
                    type="text"
                    icon={<EditOutlined />}
                    onClick={onClickChangeVersionName(version)}
                  />
                </Tooltip>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {formatDate(version.createdAt, FormatType.DateTimeFormat)} - {getCreatorName(version)}
              </Typography.Text>
          </VersionContainer>
          ))
        }
      </div>
      <div style={{ height: "30px", marginTop: "5px" }}>
        <Button
          type="primary"
          style={{ marginRight: "10px" }}
          disabled={!selectedVersion || loadingRestore}
          loading={loadingRestore}
          onClick={onRestoreDocument}
        >
          Restore version
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
      {
        editingVersion &&
        <EditVersionModal
          version={editingVersion}
          visible={!!editingVersion}
          onClose={() => setEditingVersion(undefined)}
          afterUpdate={(newVersion) => {
            editingVersion.name = newVersion.name;
            setVersions([...versions]);
            setEditingVersion(undefined);
          }}
        />
      }
    </LeftSideContainer>
  );
};

const VersionContainer = styled.div<{ $selected?: boolean }>`
  padding: 5px;
  background: ${props => props.$selected ? props.theme.colors.primary[4] : "none"};
  border-radius: 4px;

  &:hover {
    background: ${props => props.theme.colors.gray[3]};
    cursor: pointer;
  }
`;

const LeftSideContainer = styled.div`
    width: 326px;
    box-shadow: rgba(255, 255, 255, 0.05) -1px 0px 0px 0px inset;
    display: flex;
    flex-direction: column;
    background: ${props => props.theme.colors.gray[1]};
    padding: 16px 24px;
    overflow-y: auto;
    border-bottom-left-radius: 16px;
    border-top-left-radius: 16px;
`;

export default DocumentHistoryList;
