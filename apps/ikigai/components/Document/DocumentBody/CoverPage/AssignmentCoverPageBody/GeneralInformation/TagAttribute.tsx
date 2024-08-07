import { IconButton, TextField } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { t } from "@lingui/macro";

import { ADD_DOCUMENT_TAG } from "graphql/mutation/DocumentMutation";
import useDocumentStore from "store/DocumentStore";
import { AddDocumentTag } from "graphql/types";
import DocumentTag from "components/DocumentTag";

export type TagAttributeProps = {
  readOnly: boolean;
};

const TagAttribute = ({ readOnly }: TagAttributeProps) => {
  const documentId = useDocumentStore((state) => state.activeDocumentId);
  const activeDocumentTags = useDocumentStore(
    (state) => state.activeDocument?.tags,
  );
  const addActiveDocumentTag = useDocumentStore(
    (state) => state.addActiveDocumentTag,
  );
  const [addTag, { loading }] = useMutation<AddDocumentTag>(ADD_DOCUMENT_TAG);
  const [newTag, setNewTag] = useState("");

  const onAddNewTag = async () => {
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
          <TextField.Root
            size="1"
            variant="soft"
            placeholder={t`Typing new tag`}
            value={newTag}
            onChange={(e) => setNewTag(e.currentTarget.value)}
            style={{ width: 100 }}
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
      )}
    </div>
  );
};

export default TagAttribute;
