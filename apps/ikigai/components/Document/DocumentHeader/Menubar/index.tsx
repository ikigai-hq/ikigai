import React, { useState } from "react";
import * as Menubar from "@radix-ui/react-menubar";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { t, Trans } from "@lingui/macro";
import { Text } from "@radix-ui/themes";
import { useRouter } from "next/router";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";

import {
  DocumentActionPermission,
  DocumentType,
  DuplicateSpaceDocument,
} from "graphql/types";
import useDocumentStore from "store/DocumentStore";
import useCreateDocument from "hook/UseCreateDocument";
import { formatDocumentRoute } from "config/Routes";
import { DUPLICATE_SPACE_DOCUMENT } from "graphql/mutation/SpaceMutation";
import { handleError } from "graphql/ApolloClient";
import { SOFT_DELETE_DOCUMENT } from "graphql/mutation/DocumentMutation";
import AlertDialog from "components/base/AlertDialog";
import usePermission from "hook/UsePermission";

// Ref: https://www.radix-ui.com/primitives/docs/components/menubar
const IkigaiMenubar = () => {
  const allow = usePermission();
  const router = useRouter();
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const activeDocument = useDocumentStore((state) => state.activeDocument);
  const { onCreate } = useCreateDocument(activeDocument?.parentId);
  const addSpaceDocument = useDocumentStore((state) => state.addSpaceDocument);
  const removeSpaceDocument = useDocumentStore(
    (state) => state.removeSpaceDocument,
  );
  const [duplicateDocument] = useMutation<DuplicateSpaceDocument>(
    DUPLICATE_SPACE_DOCUMENT,
    {
      onError: handleError,
    },
  );
  const [deleteDocument] = useMutation(SOFT_DELETE_DOCUMENT, {
    onError: handleError,
  });

  let documentTypeName = t`Folder`;
  if (activeDocument?.documentType === DocumentType.ASSIGNMENT)
    documentTypeName = t`Assignment`;
  if (activeDocument?.documentType === DocumentType.SUBMISSION)
    documentTypeName = t`Submission`;

  const clickCreateDocument = (docType: DocumentType) => async () => {
    const res = await onCreate(docType);
    if (res) {
      router.push(formatDocumentRoute(res.documentCreate.id));
    }
  };

  const onCopyLink = () => {
    copy(window.location.href);
    toast.success(t`Copied`);
  };

  const onDuplicate = async () => {
    const { data } = await duplicateDocument({
      variables: {
        spaceId: activeDocument.spaceId,
        documentId: activeDocument.id,
      },
    });

    if (data) {
      data.spaceDuplicateDocument.forEach(addSpaceDocument);
      toast.success(t`Duplicated!`);
      router.push(formatDocumentRoute(data.spaceDuplicateDocument[0]?.id));
    }
  };

  const onDelete = async () => {
    const { data } = await deleteDocument({
      variables: {
        documentId: activeDocument.id,
        includeChildren: true,
      },
    });

    if (data) {
      toast.success(t`Deleted`);
      const otherDocumentId = removeSpaceDocument(activeDocument.id);
      if (otherDocumentId) {
        router.push(formatDocumentRoute(otherDocumentId));
      }
    }
  };

  return (
    <Menubar.Root className="MenubarRoot">
      <Menubar.Menu>
        <Menubar.Trigger
          className="MenubarTrigger"
          disabled={!allow(DocumentActionPermission.MANAGE_DOCUMENT)}
        >
          <Text size="1" weight="medium" color="gray">
            {documentTypeName}
          </Text>
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className="MenubarContent"
            align="start"
            sideOffset={5}
            alignOffset={-3}
          >
            <Menubar.Sub>
              <Menubar.SubTrigger className="MenubarSubTrigger">
                <Trans>New</Trans>
                <div className="RightSlot">
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent
                  className="MenubarSubContent"
                  alignOffset={-5}
                >
                  <Menubar.Item
                    className="MenubarItem"
                    onClick={clickCreateDocument(DocumentType.ASSIGNMENT)}
                  >
                    <Trans>Assignment</Trans>
                  </Menubar.Item>
                  <Menubar.Item
                    className="MenubarItem"
                    onClick={clickCreateDocument(DocumentType.FOLDER)}
                  >
                    <Trans>Folder</Trans>
                  </Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Item className="MenubarItem">
              <Trans>Share</Trans>
            </Menubar.Item>
            <Menubar.Item className="MenubarItem" onClick={onCopyLink}>
              <Trans>Copy Link</Trans>
            </Menubar.Item>
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Item className="MenubarItem" onClick={onDuplicate}>
              <Trans>Make a copy</Trans>
            </Menubar.Item>
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Item
              className="MenubarItem MenubarItemDanger"
              onClick={() => setShowDeleteWarning(true)}
            >
              <Trans>Delete</Trans>
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
      <AlertDialog
        title={t`Delete ${activeDocument?.title}!`}
        description={t`It will delete children files if this is folder.`}
        onConfirm={onDelete}
        open={showDeleteWarning}
        onOpenChanged={setShowDeleteWarning}
      >
        <></>
      </AlertDialog>
    </Menubar.Root>
  );
};

export default IkigaiMenubar;
