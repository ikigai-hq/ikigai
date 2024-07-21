/*
This component will ensure the application load data correctly before render application
https://raw.githubusercontent.com/ikigai-hq/ikigai/master/assets/initializing_flow.png
 */
import React, { ReactNode, useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { Trans } from "@lingui/macro";
import { Button, Text } from "@radix-ui/themes";

import TokenStorage from "storage/TokenStorage";
import {
  CheckDocument,
  CheckToken,
  DocumentActionPermission,
  GetAvailableDocument,
  GetDocumentPermissions,
  GetMyOwnSpaces,
  MyLastActivity,
  UserMe,
  VerifyMagicLink,
} from "graphql/types";
import {
  CHECK_DOCUMENT_SPACE,
  CHECK_TOKEN,
  GET_AVAILABLE_DOCUMENT,
  GET_DOCUMENT_PERMISSIONS,
  MY_LAST_ACTIVITY,
  USER_ME,
} from "graphql/query";
import UserStorage from "storage/UserStorage";
import useAuthUserStore from "store/AuthStore";
import { formatDocumentRoute, Routes } from "config/Routes";
import LayoutManagement from "./UserCredential/AuthLayout";
import Loading from "./Loading";
import { VERIFY_MAGIC_LINK } from "graphql/mutation/UserMutation";
import { GET_MY_OWN_SPACES } from "graphql/query/SpaceQuery";

interface Props {
  children: ReactNode;
}

export const Initializing: React.FC<Props> = ({ children }: Props) => {
  const router = useRouter();
  const [completeCheck, setCompleteCheck] = useState(false);
  const [hasError, setHasError] = useState();
  const setSpaceId = useAuthUserStore((state) => state.setSpaceId);
  const setUserAuth = useAuthUserStore((state) => state.setCurrentUser);
  const setDocumentPermissions = useAuthUserStore(
    (state) => state.setDocumentPermissions,
  );

  const [checkToken] = useLazyQuery<CheckToken>(CHECK_TOKEN);
  const [getDocumentPermissions] = useLazyQuery<GetDocumentPermissions>(
    GET_DOCUMENT_PERMISSIONS,
  );
  const [checkDocumentSpaceInServer] =
    useLazyQuery<CheckDocument>(CHECK_DOCUMENT_SPACE);
  const [getMe] = useLazyQuery<UserMe>(USER_ME);
  const [checkMagicLink] = useMutation<VerifyMagicLink>(VERIFY_MAGIC_LINK);
  const [getMySpaces] = useLazyQuery<GetMyOwnSpaces>(GET_MY_OWN_SPACES);
  const [getAvailableDocument] = useLazyQuery<GetAvailableDocument>(
    GET_AVAILABLE_DOCUMENT,
  );
  const [getLastActivity] = useLazyQuery<MyLastActivity>(MY_LAST_ACTIVITY);

  useEffect(() => {
    if (router.isReady) initializing();
  }, [router.isReady]);

  const initializing = async () => {
    try {
      await _initializing();
    } catch (e) {
      console.error("Cannot start application", e);
      setHasError(e.message);
    } finally {
      setCompleteCheck(true);
    }
  };

  const _initializing = async () => {
    if (completeCheck) return;
    console.info("Checking magic token...");
    await verifyMagicToken();
    console.info("Checking magic token completed!");

    console.info("Checking token ...");
    if (!(await verifyToken())) {
      console.info("Checking token failed!");
      return;
    }
    console.info("Checking token completed!");

    const documentId = router.query.documentId as string;
    const isDocumentRoute =
      documentId && router.pathname.includes("/documents");
    const isDocument = isDocumentRoute && documentId;
    if (isDocument) {
      console.info("Checking document page...", documentId);
      if (!(await verifyDocument(documentId))) {
        console.info("Checking document failed!");
        return;
      }
      console.info("Checking document page completed!");
    } else if (needRedirect()) {
      console.info("Check fallback my space document!", router.pathname);
      await checkLastActivity();
    }

    console.info("Checking Auth data...!");
    await verifyUserAuth();
    console.info("Checking Auth data completed.");
  };

  const verifyToken = async (): Promise<boolean> => {
    const token = TokenStorage.get();
    if (!token) return true;

    const { error } = await checkToken();
    if (error && error.graphQLErrors.length > 0) {
      const errorCode = error.graphQLErrors[0].extensions.code;
      if (errorCode === 401 || errorCode === 404) {
        TokenStorage.del();
        UserStorage.del();
        await router.push(Routes.Home);
        return false;
      }
    }
    return true;
  };

  const verifyDocument = async (documentId: string): Promise<boolean> => {
    if (!(await verifyDocumentPermissions(documentId))) {
      const checkMySpace = !(await checkSameSpaceAvailableDocument(documentId));
      if (checkMySpace) {
        return await checkMySpaceAvailableDocument();
      }
      return false;
    }

    return checkDocumentSpace(documentId);
  };

  const verifyDocumentPermissions = async (documentId: string) => {
    const { data } = await getDocumentPermissions({
      variables: {
        documentId,
      },
    });

    if (data) {
      setDocumentPermissions(data.documentMyPermissions);
      return data.documentMyPermissions.includes(
        DocumentActionPermission.VIEW_DOCUMENT,
      );
    }
    return false;
  };

  const verifyMagicToken = async (): Promise<boolean> => {
    const otp = router.query.otp as string;
    const userIdAsStr = router.query.user_id as string;
    const userId = parseInt(userIdAsStr, 10);

    if (otp && userId) {
      const { data } = await checkMagicLink({
        variables: {
          userId,
          otp,
        },
      });

      if (data) {
        TokenStorage.set(data.userCheckMagicLink.accessToken);
        UserStorage.set(data.userCheckMagicLink.user.id);
      }
    }

    return true;
  };

  const verifyUserAuth = async (): Promise<boolean> => {
    const token = TokenStorage.get();
    if (!token) return true;

    const { data } = await getMe();
    if (data) {
      setUserAuth(data);
    }
  };

  const checkDocumentSpace = async (documentId: string): Promise<boolean> => {
    const { data } = await checkDocumentSpaceInServer({
      variables: { documentId },
    });

    if (data) {
      setSpaceId(data.userCheckDocument);
      return true;
    }

    return false;
  };

  const checkSameSpaceAvailableDocument = async (documentId: string) => {
    const { data } = await getAvailableDocument({
      variables: {
        documentId,
      },
    });
    if (data && data.spaceGetAvailableDocument) {
      window.location.replace(
        formatDocumentRoute(data.spaceGetAvailableDocument.id),
      );
      return true;
    }
    return false;
  };

  const checkLastActivity = async () => {
    const { data } = await getLastActivity();
    if (data) {
      window.location.replace(
        formatDocumentRoute(data.userLastActivity.lastDocumentId),
      );
    } else {
      await checkMySpaceAvailableDocument();
    }
  };

  const checkMySpaceAvailableDocument = async (): Promise<boolean> => {
    const { data } = await getMySpaces();
    if (data && data.spaceOwn.length > 0) {
      window.location.replace(
        formatDocumentRoute(data.spaceOwn[0].starterDocument.id),
      );
      return true;
    }

    return false;
  };

  const needRedirect = () => {
    return router.pathname === Routes.Home;
  };

  const backToHome = () => {
    window.location.replace(Routes.Home);
  };

  if (!completeCheck) {
    return (
      <LayoutManagement>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Loading />
          <div
            style={{ width: "100%", textAlign: "center", marginTop: "15px" }}
          >
            Checking...
          </div>
        </div>
      </LayoutManagement>
    );
  }

  if (hasError) {
    return (
      <LayoutManagement>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{ width: "100%", textAlign: "center", marginTop: "15px" }}
          >
            <Text color="red">
              Cannot initializing application because: <br />
              {hasError}
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "5px",
            }}
          >
            <Button onClick={backToHome}>
              <Trans>Back to home</Trans>
            </Button>
          </div>
        </div>
      </LayoutManagement>
    );
  }

  return <>{children}</>;
};
