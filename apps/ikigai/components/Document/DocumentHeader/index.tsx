import styled from "styled-components";
import { useTitle } from "ahooks";
import { t } from "@lingui/macro";
import { Button, Text } from "@radix-ui/themes";

import useDocumentStore from "store/DocumentStore";
import { DocumentType } from "@/graphql/types";
import SubmissionHeader from "@/components/Document/DocumentHeader/SubmissionHeader";

const DocumentHeader = () => {
  const activeDocument = useDocumentStore((state) => state.activeDocument);
  const activeDocumentTitle = activeDocument?.title;

  const title = `${activeDocumentTitle || "Untitled"} - Powered by Ikigai!`;
  useTitle(title);

  let documentTypeName = t`Folder`;
  if (activeDocument?.documentType === DocumentType.ASSIGNMENT)
    documentTypeName = t`Assignment`;
  if (activeDocument?.documentType === DocumentType.SUBMISSION)
    documentTypeName = t`Submission`;

  return (
    <DocumentHeaderWrapper>
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div>
          <Text size="2" weight="bold">
            {activeDocumentTitle || "Untitled"}
          </Text>
        </div>
        <div>
          <Button variant="ghost" color="gray">
            <Text size="1" weight="medium">
              {documentTypeName}
            </Text>
          </Button>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <SubmissionHeader />
      </div>
    </DocumentHeaderWrapper>
  );
};

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
