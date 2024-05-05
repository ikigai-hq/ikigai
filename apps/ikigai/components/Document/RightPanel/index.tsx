import React from "react";

import useDocumentStore, {
  PanelContentType,
} from "context/ZustandDocumentStore";
import SubmissionPanel from "./SubmissionPanel";
import FeedbackPanel from "./FeedbackPanel";
import { BlockMenu } from "./BlockMenu";
import { RightBodyContainer } from "../common";
import { SettingQuizzes } from "./SettingQuizzes";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";

export const RightPanel = () => {
  const rightPanelConfig = useDocumentStore(
    (state) => state.documentConfig.rightPanelTab,
  );
  const rightPanelHidden = useDocumentStore((state) => state.rightPanelHidden);
  const allow = usePermission();
  const canEditDoc = allow(DocumentActionPermission.EDIT_DOCUMENT);

  if (!rightPanelConfig && !canEditDoc) return null;

  return (
    <RightBodyContainer $hide={rightPanelHidden}>
      {!rightPanelConfig && canEditDoc && <BlockMenu />}
      {rightPanelConfig === PanelContentType.Submission && <SubmissionPanel />}
      {rightPanelConfig === PanelContentType.Feedback && <FeedbackPanel />}
      {rightPanelConfig === PanelContentType.SettingQuizzes && (
        <SettingQuizzes />
      )}
    </RightBodyContainer>
  );
};
