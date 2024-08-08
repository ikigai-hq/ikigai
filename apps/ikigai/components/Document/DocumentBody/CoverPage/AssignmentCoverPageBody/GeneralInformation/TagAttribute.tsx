import { Button, DropdownMenu, IconButton, TextField } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { Trans, t } from "@lingui/macro";

import { ADD_DOCUMENT_TAG } from "graphql/mutation/DocumentMutation";
import useDocumentStore, { useAvailableTags } from "store/DocumentStore";
import { AddDocumentTag } from "graphql/types";
import DocumentTag from "components/DocumentTag";

export type TagAttributeProps = {
  readOnly: boolean;
};

const TagAttribute = ({ readOnly }: TagAttributeProps) => {
  const documentId = useDocumentStore((state) => state.activeDocumentId);
  const availableTags = useAvailableTags();
  const activeDocumentTags = useDocumentStore(
    (state) => state.activeDocument?.tags,
  );
  const addActiveDocumentTag = useDocumentStore(
    (state) => state.addActiveDocumentTag,
  );
  const [addTag, { loading }] = useMutation<AddDocumentTag>(ADD_DOCUMENT_TAG);
  const [newTag, setNewTag] = useState("");

  const onAddNewTag = async () => {
    return onAddCurrentTag(newTag);
  };

  const onAddCurrentTag = async (newTag: string) => {
    const existingTag = activeDocumentTags.find(
      (innerTag) => innerTag.tag === newTag,
    );
    if (existingTag || !documentId) return;

    const { data } = await addTag({
      variables: {
        tag: {
          documentId,
          tag: newTag,
        },
      },
    });

    if (data) {
      addActiveDocumentTag(data.documentAddTag);
      setNewTag("");
    }
  };

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {activeDocumentTags.map((tag) => (
        <DocumentTag tag={tag} key={tag.tag} readOnly={readOnly} />
      ))}
      {!readOnly && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft" size="1">
                <Trans>Add Tag</Trans>
                <DropdownMenu.TriggerIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size="1">
              <DropdownMenu.Item style={{ background: "white" }}>
                <div style={{ display: "flex", marginTop: 10 }}>
                  <TextField.Root
                    size="1"
                    variant="soft"
                    placeholder={t`Typing new tag`}
                    value={newTag}
                    onChange={(e) => setNewTag(e.currentTarget.value)}
                    style={{ width: 150 }}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <IconButton
                    variant="soft"
                    size="1"
                    style={{ marginLeft: 5 }}
                    onClick={onAddNewTag}
                    loading={loading}
                  >
                    <PlusIcon />
                  </IconButton>
                </div>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Root>
                <DropdownMenu.Label>Your Tags</DropdownMenu.Label>
                {availableTags
                  .filter(
                    (availableTag) =>
                      !activeDocumentTags.some(
                        (tag) => tag.tag === availableTag.tag,
                      ),
                  )
                  .map((availableTag) => (
                    <DropdownMenu.Item
                      key={availableTag.tag}
                      onClick={() => onAddCurrentTag(availableTag.tag)}
                    >
                      {availableTag.tag}
                    </DropdownMenu.Item>
                  ))}
              </DropdownMenu.Root>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      )}
    </div>
  );
};

export default TagAttribute;
