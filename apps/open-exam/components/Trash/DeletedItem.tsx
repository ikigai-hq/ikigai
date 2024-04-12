import { Divider, Typography } from "antd";
import styled, { useTheme } from "styled-components";
import { t, Trans } from "@lingui/macro";
import Link from "next/link";

import { Text, TextWeight } from "../common/Text";
import { TextButtonWithHover } from "../common/Button";
import { formatDocumentRoute } from "config/Routes";
import { formatDate, FormatType, fromNow } from "util/Time";
import { useModal } from "hook/UseModal";
import { ConfirmPopup } from "util/ConfirmPopup";

export type DeletedItemProps = {
  documentId?: string;
  classId?: number;
  deletedAt: number;
  title: string;
  imageSrc?: string;
  onRestore?: (itemId: string | number) => void | Promise<void>;
  onDelete?: (itemId: string | number) => void | Promise<void>;
};

const DeletedItem = (
  {
    classId, documentId, title, deletedAt, onDelete, onRestore, imageSrc,
  }: DeletedItemProps
) => {
  const { modal } = useModal();
  const theme = useTheme();
  const itemId = documentId || classId;
  const onClickRestore = () => {
    // @ts-ignore
    modal.confirm(ConfirmPopup({
      title: t`Are you sure to restore ${title}?`,
      onOk: () => {
        if (onRestore) onRestore(documentId || classId);
      },
      content: "",
      danger: false,
      onCancel: () => {},
    }));
  };
  
  const onClickDelete = () => {
    // @ts-ignore
    modal.confirm(ConfirmPopup({
      title: t`Are you sure to delete ${title} permanently?`,
      content: t`You cannot recover data if you confirm to delete.`,
      onOk: () => {
        if (onDelete) onDelete(documentId || classId);
      },
      danger: true,
      onCancel: () => {},
    }));
  };
  
  // FIXME: replace / by starter document
  const itemPath = documentId ?
    formatDocumentRoute(documentId) :
    "/";
  return (
    <ItemContainer>
      <ItemBody>
        <div style={{ cursor: "pointer" }}>
          <Link href={itemPath} target="_blank" passHref rel="noreferrer">
            <a href={itemPath} target="_blank" rel="noreferrer">
              <Text weight={TextWeight.bold}>
                {title}
              </Text>
            </a>
          </Link><br/>
          <Typography.Text type="secondary">
            {fromNow(deletedAt) } - {formatDate(deletedAt, FormatType.DateTimeFormat)}
          </Typography.Text>
        </div>
        <Divider/>
        <div style={{ flex: 1, maxHeight: "200px", marginBottom: "5px"}}>
          <img
            width="100%"
            height="100%"
            src={imageSrc}
            alt={`${itemId}-${title}`}
          />
        </div>
        <div style={{ display: "flex" }}>
          <TextButtonWithHover
            type="text"
            style={{ fontWeight: 500, color: theme.colors.primary[5] }}
            onClick={onClickRestore}
          >
            <Trans>Restore</Trans>
          </TextButtonWithHover>
          <div style={{ flex: 1 }}/>
          <TextButtonWithHover
            type="text"
            style={{ color: "red", fontWeight: 500 }}
            onClick={onClickDelete}
          >
            <Trans>Delete permanently</Trans>
          </TextButtonWithHover>
        </div>
      </ItemBody>
    </ItemContainer>
  );
};

const ItemContainer = styled.div`
  width: 95%;
  padding-bottom: 5px;
`;

const ItemBody = styled.div`
  width: 100%;
  height: 360px;
  border-radius: 8px;
  background: var(--gray-1, #FFF);
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02),
    0px 1px 6px -1px rgba(0, 0, 0, 0.02),
    0px 1px 2px 0px rgba(0, 0, 0, 0.03);
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

export default DeletedItem;
