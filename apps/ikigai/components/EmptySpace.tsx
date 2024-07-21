import { Button, Heading, Separator, Text } from "@radix-ui/themes";
import { Trans } from "@lingui/macro";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client";

import {
  AddDocumentStandalone,
  GetMySpaces,
  GetSpaceAvailableDocuments,
  IconType,
  SpaceActionPermission,
} from "graphql/types";
import { ADD_DOCUMENT_STANDALONE } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import usePermission from "hook/UsePermission";
import { formatDocumentRoute, formatStartSpace, Routes } from "config/Routes";
import {
  GET_MY_SPACES,
  GET_SPACE_AVAILABLE_DOCUMENTS,
} from "graphql/query/SpaceQuery";
import TokenStorage from "storage/TokenStorage";
import Loading from "./Loading";

export type EmptySpaceProps = {
  spaceId: number;
};

const EmptySpace = ({ spaceId }: EmptySpaceProps) => {
  const { data, loading } = useQuery<GetSpaceAvailableDocuments>(
    GET_SPACE_AVAILABLE_DOCUMENTS,
    {
      variables: {
        spaceId,
      },
      onCompleted: (data) => {
        if (data.spaceGet.nonSubmissionDocuments.length > 0) {
          window.location.replace(
            formatDocumentRoute(data.spaceGet.nonSubmissionDocuments[0].id),
          );
        }
      },
      onError: (e) => {
        console.warn("Cannot check available documents of space", e);
        window.location.replace(Routes.Home);
      },
    },
  );

  if (loading || !data) {
    return (
      <div style={{ width: "400px" }}>
        <Loading />
      </div>
    );
  }

  return <EmptySpaceInner spaceId={spaceId} />;
};

const EmptySpaceInner = ({ spaceId }: EmptySpaceProps) => {
  const router = useRouter();
  const allow = usePermission();
  const { data } = useQuery<GetMySpaces>(GET_MY_SPACES, {
    skip: !TokenStorage.get(),
  });
  const [createStandaloneDocument, { loading }] =
    useMutation<AddDocumentStandalone>(ADD_DOCUMENT_STANDALONE, {
      onError: handleError,
    });

  const createAssignment = async () => {
    const { data } = await createStandaloneDocument({
      variables: {
        data: {
          title: "New Assignment",
          index: 0,
          parentId: null,
          iconType: IconType.EMOJI,
          iconValue: "✏️",
        },
        spaceId,
        isAssignment: true,
      },
    });

    if (data) {
      window.location.replace(formatDocumentRoute(data.documentCreate.id));
    }
  };

  const switchSpace = (spaceId: number) => {
    router.push(formatStartSpace(spaceId));
  };

  const spaces = (data?.spaceMine || []).filter(
    (space) => space.id !== spaceId,
  );
  return (
    <div style={{ width: "400px" }}>
      <div>
        <Heading size="6" style={{ marginBottom: 10 }}>
          <Trans>Your space is empty</Trans>
        </Heading>
        {allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) && (
          <div>
            <div>
              <Text>Start using by create new assignment</Text>
            </div>
            <Button
              onClick={createAssignment}
              loading={loading}
              disabled={loading}
            >
              <Trans>Create assignment</Trans>
            </Button>
          </div>
        )}
      </div>
      {spaces.length > 0 && (
        <>
          <Separator
            style={{ width: "100%", marginTop: 15, marginBottom: 15 }}
          />
          <div>
            <div>
              <Text>You can switch to other space</Text>
            </div>
            <div>
              {spaces.map((space) => (
                <div
                  key={space.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <Text weight="bold">{space.name}</Text>
                  <Button
                    onClick={() => switchSpace(space.id)}
                    variant="soft"
                    size="1"
                  >
                    <Trans>Switch</Trans>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmptySpace;
