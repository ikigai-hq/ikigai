import React, { ReactNode, useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { Trans } from "@lingui/macro";
import { Button, Text } from "@radix-ui/themes";

import TokenStorage from "storage/TokenStorage";
import {
  CheckDocument,
  CheckToken,
  GetMySpaces,
  MyLastActivity,
  UserMe,
  VerifyMagicLink,
} from "../graphql/types";
import {
  CHECK_DOCUMENT,
  CHECK_TOKEN,
  MY_LAST_ACTIVITY,
  USER_ME,
} from "../graphql/query";
import UserStorage from "storage/UserStorage";
import useAuthUserStore from "store/AuthStore";
import { formatDocumentRoute, Routes } from "config/Routes";
import LayoutManagement from "./UserCredential/AuthLayout";
import Loading from "./Loading";
import { VERIFY_MAGIC_LINK } from "graphql/mutation/UserMutation";
import { GET_MY_SPACES } from "../graphql/query/SpaceQuery";

interface Props {
  children: ReactNode;
}

export const Initializing: React.FC<Props> = ({ children }: Props) => {
  const router = useRouter();
  const [completeCheck, setCompleteCheck] = useState(false);
  const [hasError, setHasError] = useState();
  const setSpaceId = useAuthUserStore((state) => state.setSpaceId);
  const setUserAuth = useAuthUserStore((state) => state.setCurrentUser);

  const [checkToken] = useLazyQuery<CheckToken>(CHECK_TOKEN);
  const [checkDocument] = useLazyQuery<CheckDocument>(CHECK_DOCUMENT);
  const [getMe] = useLazyQuery<UserMe>(USER_ME, {
    fetchPolicy: "network-only",
  });
  const [getLastActivity] = useLazyQuery<MyLastActivity>(MY_LAST_ACTIVITY);
  const [checkMagicLink] = useMutation<VerifyMagicLink>(VERIFY_MAGIC_LINK);
  const [getMySpaces] = useLazyQuery<GetMySpaces>(GET_MY_SPACES);

  useEffect(() => {
    if (router.isReady) verifyAuth();
  }, [router.isReady]);

  const verifyAuth = async () => {
    try {
      console.info("Verifying Token");
      let checkNext = await verifyToken();
      console.info("Verifying Magic Link", checkNext);
      if (checkNext) checkNext = await verifyMagicLink();
      console.info("Verifying Document", checkNext);
      if (checkNext) checkNext = await verifyDocument();
      console.info("Verifying User Authentication", checkNext);
      if (checkNext) checkNext = await verifyUserAuth();
      console.info("Verifying Possible Document", checkNext);
      if (checkNext) await verifyPossibleDocument();
    } catch (e) {
      console.error("Cannot verify user auth", e);
      setHasError(e.message);
    } finally {
      setCompleteCheck(true);
    }
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

  const verifyDocument = async (): Promise<boolean> => {
    const documentId = router.query.documentId as string;
    const isDocumentRoute =
      documentId && router.pathname.includes("/documents");
    const token = TokenStorage.get();
    if (isDocumentRoute && !token) {
      await router.push(Routes.Home);
      return false;
    }

    if (!token || !isDocumentRoute) return true;

    return await checkDocumentSpace(documentId);
  };

  const verifyPossibleDocument = async (): Promise<boolean> => {
    const isHome = router.pathname === Routes.Home;
    const token = TokenStorage.get();
    if (isHome && token) {
      const { data } = await getLastActivity();
      if (data) {
        // Found Last activity. Recheck auth user
        await checkDocumentSpace(data.userLastActivity.lastDocumentId);
        await verifyUserAuth();
        await router.push(
          formatDocumentRoute(data.userLastActivity.lastDocumentId),
        );
        return false;
      }
    }

    const documentId = router.query.documentId as string;
    const isDocumentRoute =
      documentId && router.pathname.includes("/documents");
    if (isDocumentRoute && token) {
      await router.push(formatDocumentRoute(documentId));
      return false;
    }

    const { data } = await getMySpaces();
    if (isHome && data && data.spaceMine.length > 0) {
      window.location.replace(
        formatDocumentRoute(data.spaceMine[0].starterDocument.id),
      );
      return false;
    }

    return true;
  };

  const verifyMagicLink = async (): Promise<boolean> => {
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
      return true;
    }
    return false;
  };

  const checkDocumentSpace = async (documentId: string): Promise<boolean> => {
    const { data } = await checkDocument({ variables: { documentId } });
    if (data) {
      setSpaceId(data.userCheckDocument);
      return true;
    }
    await router.push(Routes.Home);
    return false;
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
