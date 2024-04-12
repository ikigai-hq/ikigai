import React from "react";
import useDocumentStore, {
  PanelContentType,
} from "context/ZustandDocumentStore";
import useDocumentPermission from "hook/UseDocumentPermission";
import { DocumentPermission } from "util/permission";
import SubmissionPanel from "./SubmissionPanel";
import FeedbackPanel from "./FeedbackPanel";
import { BlockMenu } from "./BlockMenu";
import { RightBodyContainer } from "../common";
import { SettingQuizzes } from "./SettingQuizzes";

export const RightPanel = () => {
  const rightPanelConfig = useDocumentStore(
    (state) => state.documentConfig.rightPanelTab,
  );
  const rightPanelHidden = useDocumentStore((state) => state.rightPanelHidden);
  const documentAllow = useDocumentPermission();
  const canEditDoc = documentAllow(DocumentPermission.EditDocument);

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
