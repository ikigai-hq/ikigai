import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Popover } from "antd";
import styled from "styled-components";

import useDocumentStore from "../../../../context/DocumentStore";
import { IconType } from "graphql/types";
import useUpdateDocument from "hook/UseUpdateDocument";

const DocumentIconHeader = () => {
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const iconValue = useDocumentStore(
    (state) => state.activeDocument?.iconValue,
  );
  const updateActiveDocument = useDocumentStore(
    (state) => state.updateActiveDocument,
  );
  const updateSpaceDocument = useDocumentStore(
    (state) => state.updateSpaceDocument,
  );
  const updateDocumentServer = useUpdateDocument();

  const onChangeEmoji = (emoji: { native: string }) => {
    updateActiveDocument({
      iconType: IconType.EMOJI,
      iconValue: emoji.native,
    });
    updateSpaceDocument(activeDocumentId, {
      iconType: IconType.EMOJI,
      iconValue: emoji.native,
    });
    updateDocumentServer({
      iconType: IconType.EMOJI,
      iconValue: emoji.native,
    });
  };

  return (
    <div>
      <Popover
        arrow={false}
        content={
          <div>
            <Picker
              data={data}
              onEmojiSelect={onChangeEmoji}
              maxFrequentRows={1}
              previewPosition="none"
              theme="light"
            />
          </div>
        }
        trigger={"click"}
        overlayInnerStyle={{ padding: "0" }}
      >
        <PickIconButton>{iconValue || "✏️"}</PickIconButton>
      </Popover>
    </div>
  );
};

const PickIconButton = styled.div`
  width: fit-content;
  font-size: 28px;
  cursor: pointer;
  padding-right: 10px;
  padding-left: 10px;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray[4]};
    border-radius: 8px;
  }
`;

export default DocumentIconHeader;
