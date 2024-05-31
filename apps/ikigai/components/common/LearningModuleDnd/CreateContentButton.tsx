import React from "react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import { DropdownMenu } from "@radix-ui/themes";

import { AddDocumentStandaloneV2, DocumentType, IconType } from "graphql/types";
import { formatDocumentRoute } from "config/Routes";
import useDocumentStore from "store/DocumentStore";
import { handleError } from "graphql/ApolloClient";
import { ADD_DOCUMENT_STANDALONE_V2 } from "graphql/mutation/DocumentMutation";
import useSpaceStore from "store/SpaceStore";
import IkigaiDropdown from "components/base/Dropdown";

export type CreateContentButtonProps = {
  parentId: string | null;
  children: React.ReactElement<any, any>;
};

const CreateContentButton = ({
  parentId,
  children,
}: CreateContentButtonProps) => {
  const router = useRouter();
  const [createStandaloneDocument] = useMutation<AddDocumentStandaloneV2>(
    ADD_DOCUMENT_STANDALONE_V2,
    {
      onError: handleError,
    },
  );
  const documents = useDocumentStore((state) => state.spaceDocuments);
  const addSpaceDocument = useDocumentStore((state) => state.addSpaceDocument);
  const spaceId = useSpaceStore((state) => state.spaceId);

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
    const res = await onCreate(docType);
    if (res) {
      router.push(formatDocumentRoute(res.documentCreate.id));
    }
  };

  return (
    <IkigaiDropdown
      content={
        <>
          <DropdownMenu.Item
            onClick={() => clickCreateDocument(DocumentType.FOLDER)}
          >
            Folder
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => clickCreateDocument(DocumentType.FOLDER)}
          >
            Assignment
          </DropdownMenu.Item>
        </>
      }
    >
      {children}
    </IkigaiDropdown>
  );
};

export default CreateContentButton;
