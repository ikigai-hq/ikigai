import { Dropdown, MenuProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import styled, { useTheme } from "styled-components";
import { t, Trans } from "@lingui/macro";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";

import { TextButton } from "components/common/Button";
import { AddDocumentStandaloneV2, DocumentType, IconType } from "graphql/types";
import { Text, TextWeight } from "components/common/Text";
import { formatDocumentRoute } from "config/Routes";
import useDocumentStore from "../../../store/DocumentStore";
import { handleError } from "graphql/ApolloClient";
import { ADD_DOCUMENT_STANDALONE_V2 } from "graphql/mutation/DocumentMutation";
import useSpaceStore from "../../../store/SpaceStore";

export type CreateContentButtonProps = {
  parentId: string | null;
  children?: React.ReactElement<any, any>;
  onlyIcon?: boolean;
};

const CreateContentButton = ({
  parentId,
  children,
  onlyIcon = false,
}: CreateContentButtonProps) => {
  const router = useRouter();
  const theme = useTheme();
  const [createStandaloneDocument] = useMutation<AddDocumentStandaloneV2>(
    ADD_DOCUMENT_STANDALONE_V2,
    {
      onError: handleError,
    },
  );
  const [loading, setLoading] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const documents = useDocumentStore((state) => state.spaceDocuments);
  const addSpaceDocument = useDocumentStore((state) => state.addSpaceDocument);
  const spaceId = useSpaceStore((state) => state.spaceId);
  const color = theme.colors.gray[5];

  const onCreate = async (docType: DocumentType) => {
    const indexes = documents
      .filter((doc) => !doc.deletedAt)
      .filter((doc) => doc.parentId === parentId)
      .map((doc) => doc.index);
    const index = indexes.length ? Math.max(...indexes) + 1 : 1;

    const isAssignment = docType === DocumentType.ASSIGNMENT;
    const { data } = await createStandaloneDocument({
      variables: {
        data: {
          title: "Untitled",
          index,
          parentId,
          iconType: IconType.EMOJI,
          iconValue: isAssignment ? "✏️" : "📂",
        },
        spaceId,
        isAssignment,
      },
    });

    if (data) {
      addSpaceDocument(data.documentCreate);
    }

    return data;
  };

  const clickCreateDocument = async (docType: DocumentType) => {
    setLoading(true);
    const res = await onCreate(docType);
    setIsOpenDropdown(false);
    if (res) {
      router.push(formatDocumentRoute(res.documentCreate.id));
      setLoading(false);
    }
  };

  const menuCreate: MenuProps["items"] = [
    {
      key: "1",
      label: t`Folder`,
      onClick: () => clickCreateDocument(DocumentType.FOLDER),
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
          {!onlyIcon && (
            <Text level={2} weight={TextWeight.medium} color={color}>
              {parentId ? (
                <Trans>Add sub content</Trans>
              ) : (
                <Trans>Add content</Trans>
              )}
            </Text>
          )}
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

const AddDocumentBtn = styled(TextButton)<{ $isHighlight?: boolean }>`
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
