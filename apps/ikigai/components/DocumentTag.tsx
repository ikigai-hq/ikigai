import { Badge } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import React from "react";
import { useMutation } from "@apollo/client";

import { RemoveDocumentTag } from "graphql/types";
import { REMOVE_DOCUMENT_TAG } from "graphql/mutation/DocumentMutation";
import useDocumentStore, { ITag } from "store/DocumentStore";

export type DocumentTagProps = {
  tag: ITag;
  readOnly: boolean;
};

const DocumentTag = ({ tag, readOnly }: DocumentTagProps) => {
  const documentId = useDocumentStore((state) => state.activeDocumentId);
  const activeDocumentTags = useDocumentStore(
    (state) => state.activeDocument?.tags || [],
  );
  const removeActiveDocumentTag = useDocumentStore(
    (state) => state.removeActiveDocumentTag,
  );
  const [removeTag] = useMutation<RemoveDocumentTag>(REMOVE_DOCUMENT_TAG);

  const onRemoveTag = async () => {
    const tagName = tag.tag;
    const existingTag = activeDocumentTags.find(
      (innerTag) => innerTag.tag === tagName,
    );
    if (!existingTag || !documentId) return;
    const { data } = await removeTag({
      variables: {
        tag: {
          documentId,
          tag: tagName,
        },
      },
    });

    if (data) {
      removeActiveDocumentTag({ tag: tagName });
    }
  };

  return (
    <Badge color="gold" key={tag.tag}>
      {tag.tag}
      {!readOnly && (
        <Cross2Icon style={{ cursor: "pointer" }} onClick={onRemoveTag} />
      )}
    </Badge>
  );
};

export default DocumentTag;
