import React from "react";
import { useRouter } from "next/router";
import { DropdownMenu } from "@radix-ui/themes";

import { DocumentType } from "graphql/types";
import { formatDocumentRoute } from "config/Routes";
import IkigaiDropdown from "components/base/Dropdown";
import useCreateDocument from "hook/UseCreateDocument";

export type CreateContentButtonProps = {
  parentId: string | null;
  children: React.ReactElement<any, any>;
};

const CreateContentButton = ({
  parentId,
  children,
}: CreateContentButtonProps) => {
  const router = useRouter();
  const { onCreate } = useCreateDocument(parentId);

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
            onClick={() => clickCreateDocument(DocumentType.ASSIGNMENT)}
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
