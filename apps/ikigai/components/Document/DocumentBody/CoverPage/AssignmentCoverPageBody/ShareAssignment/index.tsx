import {
  Button,
  Heading,
  Separator,
  Switch,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import { Link1Icon } from "@radix-ui/react-icons";
import { useMutation, useQuery } from "@apollo/client";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";

import { GET_DOCUMENT_EMBED_SESSION } from "graphql/query/DocumentQuery";
import { useEffect, useState } from "react";
import {
  EmbeddedType,
  GetDocumentEmbedSession,
  UpsertDocumentEmbedSession,
} from "graphql/types";
import Loading from "components/Loading";
import { formatShareDocument } from "config/Routes";
import useDocumentStore from "store/DocumentStore";
import { UPSERT_DOCUMENT_EMBED } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import Modal from "components/base/Modal";

const ShareAssignment = () => {
  const [showPreview, setShowPreview] = useState(false);
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const activeDocumentTitle = useDocumentStore(
    (state) => state.activeDocument?.title,
  );
  const { data, loading } = useQuery<GetDocumentEmbedSession>(
    GET_DOCUMENT_EMBED_SESSION,
    {
      fetchPolicy: "network-only",
      variables: {
        documentId: activeDocumentId,
      },
      skip: !activeDocumentId,
    },
  );
  const [upsertEmbed, { loading: upsertLoading }] =
    useMutation<UpsertDocumentEmbedSession>(UPSERT_DOCUMENT_EMBED, {
      onError: handleError,
    });
  const [isActive, setIsActive] = useState(
    data?.documentGetEmbeddedSession?.isActive || false,
  );
  const [sessionId, setSessionId] = useState(
    data?.documentGetEmbeddedSession?.sessionId,
  );

  useEffect(() => {
    if (data && !data.documentGetEmbeddedSession) {
      initialEmbedSession();
    }

    if (data && data.documentGetEmbeddedSession) {
      setIsActive(data.documentGetEmbeddedSession.isActive);
      setSessionId(data.documentGetEmbeddedSession.sessionId);
    }
  }, [data]);

  const initialEmbedSession = async () => {
    const { data } = await upsertEmbed({
      variables: {
        session: {
          documentId: activeDocumentId,
          isActive: false,
          embeddedType: EmbeddedType.FORM,
        },
      },
    });

    if (data) {
      setIsActive(data.documentUpsertEmbeddedSession.isActive);
      setSessionId(data.documentUpsertEmbeddedSession.sessionId);
    }
  };

  const onChangeActive = async (isActive: boolean) => {
    const { data } = await upsertEmbed({
      variables: {
        session: {
          documentId: activeDocumentId,
          isActive,
          embeddedType: EmbeddedType.FORM,
        },
      },
    });

    if (data) {
      setIsActive(data.documentUpsertEmbeddedSession.isActive);
    }
  };

  const onCopyShareUrl = () => {
    const url = formatShareDocument(activeDocumentId, sessionId);
    copy(url);
    toast.success(t`Copied!`);
  };

  if (loading) {
    return <Loading />;
  }

  const url = formatShareDocument(activeDocumentId, sessionId);
  return (
    <div>
      <div>
        <Text weight="bold">Enable Share & Embed feature</Text>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Text color={"gray"} size="2">
            <Trans>
              Your students will need to fill out a form before they can start
              the assignment. The responses of students will be stored in the
              Share Responses tab.
            </Trans>
          </Text>
        </div>
        <div style={{ marginTop: 5 }}>
          <Switch
            checked={isActive}
            onCheckedChange={onChangeActive}
            disabled={upsertLoading}
          />
        </div>
      </div>
      <Separator style={{ width: "100%", marginTop: 15, marginBottom: 15 }} />
      <div style={{ display: "flex", gap: 15, height: 600 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
          }}
        >
          <div>
            <Heading size="3">
              <Trans>Share link</Trans>{" "}
            </Heading>
          </div>
          <div>
            <div style={{ display: "flex" }}>
              <TextField.Root value={url} style={{ flex: 1 }} size="2" readOnly>
                <TextField.Slot side="right">
                  <Button variant="soft" size="1" onClick={onCopyShareUrl}>
                    <Link1Icon height="16" width="16" />
                    <Trans>Copy Link</Trans>
                  </Button>
                </TextField.Slot>
              </TextField.Root>
            </div>
            <Text color={"gray"} size="2">
              <Trans>
                Anyone with the link can <b>do the assignment</b> by filling out
                a form with their email, phone number, and name.
              </Trans>
            </Text>
          </div>
          <Separator style={{ width: "100%" }} />
          <div style={{ flex: 1 }}>
            <Heading size="3">
              <Trans>Embed code</Trans>
            </Heading>
            <Text color={"gray"} size="2">
              <Trans>
                Copy the code below and paste it into your website to embed this
                assignment.
              </Trans>
            </Text>
            <TextArea
              value={`<iframe src="${url}?embedded=true" title="${activeDocumentTitle}" width="100%" height="100%" frameborder="0"></iframe>`}
              readOnly
              rows={6}
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Heading size="3">
            <Trans>Form Preview</Trans>
          </Heading>
          <iframe
            src={url}
            title="Ikigia Embedded"
            width="100%"
            height="100%"
            frameBorder={0}
          ></iframe>
        </div>
      </div>
      {showPreview && (
        <ReviewEmbeddedForm
          open={showPreview}
          onChangeOpen={setShowPreview}
          url={`${url}?readOnly=true`}
        />
      )}
    </div>
  );
};

type ReviewEmbeddedFormProps = {
  open: boolean;
  onChangeOpen: (open: boolean) => void;
  url: string;
};

const ReviewEmbeddedForm = ({
  open,
  onChangeOpen,
  url,
}: ReviewEmbeddedFormProps) => {
  return (
    <Modal
      content={
        <div style={{ height: "80vh" }}>
          <iframe
            src={url}
            title="Ikigia Embedded"
            width="100%"
            height="100%"
            frameBorder={0}
          ></iframe>
        </div>
      }
      minWidth={"90vw"}
      maxWidth={"90vw"}
      open={open}
      onOpenChange={onChangeOpen}
    >
      <></>
    </Modal>
  );
};

export default ShareAssignment;
