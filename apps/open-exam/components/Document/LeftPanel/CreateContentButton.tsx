import {Dropdown, MenuProps} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import styled, {useTheme} from "styled-components";
import {useRouter} from "next/router";
import {t, Trans} from "@lingui/macro";

import {TextButton} from "components/common/Button";
import {DocumentType} from "graphql/types";
import {formatDocumentRoute} from "config/Routes";
import {Text, TextWeight} from "components/common/Text";
import useClassStore from "context/ZustandClassStore";
import useDocumentStore from "context/ZustandDocumentStore";
import {DEFAULT_DOCUMENT_TITLE} from "components/Document/common";

export type CreateContentButtonProps = {
  parentId: string | null;
  children?: React.ReactElement<any, any>;
  onlyIcon?: boolean
};

const CreateContentButton = (
  {
    parentId,
    children,
    onlyIcon = false,
  }: CreateContentButtonProps
) => {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const createDocument = useDocumentStore((state) => state.createDocument);
  const { documents, addClassDocument, refetchDocuments, classId } = useClassStore(
    (state) => {
      return {
        classId: state.classId,
        documents: state.documents,
        addClassDocument: state.addClassDocument,
        refetchDocuments: state.fetchAndSetDocuments
      };
    }
  );
  
  const color = theme.colors.gray[5];
  
  const setLessonType = async (documentId: string, docType: DocumentType) => {
    switch (docType) {
      case DocumentType.NORMAL:
        await addClassDocument(documentId, false);
        break;
      case DocumentType.ASSIGNMENT:
        await addClassDocument(documentId, true);
        break;
    }
  };
  
  const onCreate = async (docType: DocumentType) => {
    const indexes = documents
      .filter((doc) => !doc.document.deletedAt)
      .filter((doc) => doc.document.parentId === parentId)
      .map((doc) => doc.document.index);
    const index = indexes.length ? Math.max(...indexes) + 1 : 1;
    const documentId = await createDocument(
      DEFAULT_DOCUMENT_TITLE,
      "",
      parentId,
      index
    );
    await setLessonType(documentId, docType);
    return documentId;
  };
  
  const clickCreateDocument = async (docType: DocumentType) => {
    setLoading(true);
    const res = await onCreate(docType);
    refetchDocuments(classId);
    setIsOpenDropdown(false);
    if (res) {
      router.push(formatDocumentRoute(res));
      setLoading(false);
    }
  };
  
  const menuCreate: MenuProps["items"] = [
    {
      key: "1",
      label: t`Document`,
      onClick: () => clickCreateDocument(DocumentType.NORMAL),
    },
    {
      key: "2",
      label: t`Assignment`,
      onClick: () => clickCreateDocument(DocumentType.ASSIGNMENT),
    },
  ];
  
  if (children) {
    return (
      <Dropdown menu={{ items: menuCreate }} trigger={["click"]}>
        {children}
      </Dropdown>
    );
  }
  
  return (
    <StyledDocumentAction shouldPadding={!!parentId}>
      <Dropdown
        open={isOpenDropdown}
        onOpenChange={(open) => setIsOpenDropdown(open)}
        menu={{ items: menuCreate }}
        trigger={["click"]}
      >
        <AddDocumentBtn
          type="text"
          icon={<PlusOutlined style={{ color }} />}
          loading={loading}
        >
          {
            !onlyIcon && (
              <Text level={2} weight={TextWeight.medium} color={color}>
                {parentId ? (
                  <Trans>Add sub content</Trans>
                ) : (
                  <Trans>Add content</Trans>
                )}
              </Text>
            )
          }
        </AddDocumentBtn>
      </Dropdown>
    </StyledDocumentAction>
  );
};

const StyledDocumentAction = styled.div<{ shouldPadding?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-left: ${(props) => (props.shouldPadding ? 40 : 0)}px;
`;

const AddDocumentBtn = styled(TextButton) <{ $isHighlight?: boolean }>`
  float: left;
  font-weight: 500;
  margin-bottom: 5px;
  margin-top: 5px;
  padding: 5px 10px;
  position: ${({ $isHighlight }) => ($isHighlight ? "relative" : "unset")};
  z-index: ${({ $isHighlight }) => ($isHighlight ? 2 : "unset")};
  border: ${({ $isHighlight, theme }) =>
  $isHighlight ? theme.colors.gray[4] : "transparent"};

  &:hover {
    background: ${({ theme }) => theme.colors.gray[2]} !important;
    border: ${({ $isHighlight, theme }) =>
  $isHighlight ? theme.colors.gray[4] : "transparent"};
  }
`;

export default CreateContentButton;
