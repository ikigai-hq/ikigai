import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";
import styled from "styled-components";

import { isNonAuthenticatePage } from "config/Routes";
import TokenStorage from "storage/TokenStorage";
import Loading from "components/Loading";
import CurrentPathStorage from "storage/CurrentPathStorage";
import { redirectToHome } from "./UrlUtil";

interface Props {
  children: JSX.Element;
}

const StyledLoading = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const RouteGuard = ({ children }: Props): JSX.Element => {
  const router = useRouter();
  let token = TokenStorage.get();

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const hideContent = (value: boolean) => setInitialLoading(value);

    let isAuthenticated = !!token;
    if (router.query.accessToken) {
      console.info("Found access token in query");
      TokenStorage.set(router.query.accessToken as string);
      isAuthenticated = true;
      delete router.query.accessToken;
      router.replace(router, undefined);
    }

    if (router.isReady) {
      if (!isAuthenticated && !isNonAuthenticatePage(router.pathname)) {
        CurrentPathStorage.set(router.asPath);
        router.events.on("routeChangeStart", () => hideContent(true));
        router.events.on("routeChangeComplete", () => hideContent(false));
        redirectToHome(router);
      } else {
        setInitialLoading(false);
      }
    }
    return () => {
      router.events.off("routeChangeStart", () => hideContent(true));
      router.events.off("routeChangeComplete", () => hideContent(false));
    };
  }, [router.isReady]);

  if (router.pathname.includes('/share/')) {
    return children;
  }

  if (initialLoading) {
    return (
      <StyledLoading>
        <Loading />
      </StyledLoading>
    );
  }

  return children;
};
