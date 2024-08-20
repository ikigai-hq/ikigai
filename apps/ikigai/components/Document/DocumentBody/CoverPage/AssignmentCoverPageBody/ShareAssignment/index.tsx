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
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";

const ShareAssignment = () => {
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
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
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <Heading size="5">
          <Trans>Share</Trans>{" "}
          <Switch
            checked={isActive}
            onCheckedChange={onChangeActive}
            disabled={upsertLoading}
          />
        </Heading>
        <Text color={"gray"} size="1">
          <Trans>
            Assignment is <b>not sharing</b> with other people
          </Trans>
        </Text>
      </div>
      <div>
        <div style={{ maxWidth: 500 }}>
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
            Anyone with link can <b>do the assignment</b> by fill a
            <b> Form with email, phone number, first name, and last name.</b>
          </Trans>
        </Text>
      </div>
      <Separator style={{ width: "100%" }} />
      <div>
        <Heading size="5">
          <Trans>Embed into website</Trans>
        </Heading>
        <Text color={"gray"} size="2">
          <Trans>Copy code below and paste into your website</Trans>
        </Text>
        <TextArea
          value={`<iframe src="${url}" width: 100%; height: 100%;"></iframe>`}
          readOnly
        />
      </div>
    </div>
  );
};

export default ShareAssignment;
