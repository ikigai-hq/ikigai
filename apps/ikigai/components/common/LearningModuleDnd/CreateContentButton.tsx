import React from "react";
import { useRouter } from "next/router";
import { DropdownMenu } from "@radix-ui/themes";
import { Trans } from "@lingui/macro";

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
        <div style={{ padding: 5 }}>
          <DropdownMenu.Item
            onClick={() => clickCreateDocument(DocumentType.FOLDER)}
          >
            📁 <Trans>Folder</Trans>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => clickCreateDocument(DocumentType.ASSIGNMENT)}
          >
            📝 <Trans>Assignment</Trans>
          </DropdownMenu.Item>
        </div>
      }
    >
      {children}
    </IkigaiDropdown>
  );
};

export default CreateContentButton;
