import styled from "styled-components";
import { useTitle } from "ahooks";
import { Badge, Separator, Text } from "@radix-ui/themes";

import useDocumentStore from "store/DocumentStore";
import { DocumentType } from "graphql/types";
import SubmissionHeader from "components/Document/DocumentHeader/SubmissionHeader";
import AssignmentHeader from "./AssignmentHeader";
import IkigaiMenubar from "./Menubar";
import { formatDocumentRoute } from "config/Routes";
import { documentIcon } from "util/DocumentUtil";

const DocumentHeader = () => {
  const activeDocument = useDocumentStore((state) => state.activeDocument);
  const activeDocumentTitle = useDocumentStore(
    (state) => state.activeDocument?.title,
  );
  const parent = useDocumentStore((state) =>
    state.spaceDocuments.find(
      (spaceDocument) => spaceDocument.id === activeDocument?.parentId,
    ),
  );

  const onClickParent = () => {
    if (parent) {
      window.open(formatDocumentRoute(parent.id));
    }
  };
  const title = `${activeDocumentTitle || "Untitled"} - Powered by Ikigai!`;
  useTitle(title);

  return (
    <div>
      <DocumentHeaderWrapper>
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          <div>
            <Text size="2" weight="bold" truncate>
              {documentIcon(activeDocument)} {activeDocumentTitle || "Untitled"}
            </Text>
            {parent && (
              <Badge
                variant="soft"
                color="gray"
                size="1"
                radius="full"
                style={{ marginLeft: 5, cursor: "pointer" }}
                onClick={onClickParent}
              >
                {documentIcon(parent)} {parent.title}
              </Badge>
            )}
          </div>
          <div style={{ marginLeft: -6 }}>
            <IkigaiMenubar />
          </div>
        </div>
        {activeDocument?.documentType === DocumentType.ASSIGNMENT && (
          <AssignmentHeader />
        )}
        <div style={{ display: "flex" }}>
          <SubmissionHeader />
        </div>
      </DocumentHeaderWrapper>
      <Separator style={{ width: "100%" }} />
    </div>
  );
};

export const PageTitle = styled.input`
  &&& {
    font-size: 20px;
    font-weight: 700;
    padding-left: 0;
    overflow: hidden;
    line-height: normal;
    border: none;
    width: 100%;

    &:focus {
      outline: none !important;
      box-shadow: none !important;
      border-color: transparent !important;
    }
  }
`;

export const DocumentHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  width: 100%;
  box-sizing: border-box;
  height: 50px;
  padding-left: 10px;
  padding-right: 10px;
`;

export default DocumentHeader;
