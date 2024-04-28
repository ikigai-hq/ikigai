import React, { useEffect, useState } from "react";
import {
  GetDocumentDetail_documentGet as IDocument,
  SubmissionEventType,
  SubmissionSubscribe,
} from "graphql/types";
import { useSubscription } from "@apollo/client";
import { t } from "@lingui/macro";

import { Container } from "../common";
import { ConfirmPopup } from "util/ConfirmPopup";
import useDocumentStore from "context/ZustandDocumentStore";
import { SUBMISSION_SUBSCRIPTION } from "graphql/subscription";
import DocumentHeader from "../DocumentHeader";
import { useModal } from "hook/UseModal";
import useSubmitSubmission from "hook/UseSubmitSubmission";
import { PresentationMode } from "components/common/RichMarkdownEditor/PresentationMode";
import SubmitSubmission from "./SubmitSubmission";
import styled from "styled-components";
import { Tooltip } from "antd";

export type SubmissionDocumentProps = {
  currentDocument: IDocument;
};

const DoingSubmissionDocument = ({
  currentDocument,
}: SubmissionDocumentProps) => {
  const { modal } = useModal();
  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const { loading, onSubmit, deadline, backToPreviousPage } =
    useSubmitSubmission(currentDocument);

  const isFocusMode = useDocumentStore((state) => state.isFocusMode);
  const setFocusMode = useDocumentStore((state) => state.setFocusMode);
  const [openTooltip, setOpenTooltip] = useState(false);
  const focusModeTooltip = () => {
    return (
      <span>
        Press <EscButton>ESC</EscButton> to exit focus mode
      </span>
    );
  };

  // Focus Mode
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isFocusMode) {
      setOpenTooltip(true);

      timeout = setTimeout(() => {
        setOpenTooltip(false);
      }, 5000);
    } else {
      setOpenTooltip(false);
      clearTimeout(timeout);
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setFocusMode(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocusMode]);

  useSubscription<SubmissionSubscribe>(SUBMISSION_SUBSCRIPTION, {
    variables: {
      submissionId: activeDocument.submission?.id,
    },
    onData: (options) => {
      const eventData = options.data.data;
      if (
        eventData &&
        eventData.submissionSubscribe.eventType ===
          SubmissionEventType.SUBMIT_COMPLETED
      ) {
        submitCompleted();
      }
    },
  });

  const submitCompleted = () => {
    if (loading) return;
    modal.confirm(
      ConfirmPopup({
        title: t`Your submission is completed. We will move you to assignment page!`,
        okText: t`Submit`,
        content: "",
        onOk: async () => {
          backToPreviousPage();
        },
        cancelText: undefined,
        onCancel: async () => {
          backToPreviousPage();
        },
      }) as any,
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Tooltip
        title={focusModeTooltip}
        open={openTooltip}
        arrow={false}
        color="rgba(0, 0, 0, 0.5)"
        overlayStyle={{ top: 10 }}
        overlayInnerStyle={{ padding: "10px 20px" }}
      >
        <Container>
          <DocumentHeader>
            <SubmitSubmission deadline={deadline} onSubmit={onSubmit} />
          </DocumentHeader>
          <PresentationMode
            isDoingSubmission
            currentDocument={currentDocument}
          />
        </Container>
      </Tooltip>
    </div>
  );
};

const EscButton = styled.span`
  display: inline-block;
  padding: 4px 6px;
  border-radius: 4px;
  border: 1px solid #fff;
`;

export default DoingSubmissionDocument;
