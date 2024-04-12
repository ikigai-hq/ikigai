import { NextRouter } from "next/router";
import urlencode from "urlencode";
import { Routes } from "../config/Routes";

export const getQueryParam = (
  router: NextRouter,
  key: string
): string | string[] | undefined => {
  return router.query[key];
};

export const ANNOUNCEMENT_ID_KEY = "announcement-id";

export const getAnnouncementId = (router: NextRouter): number | undefined => {
  const value = getQueryParam(router, ANNOUNCEMENT_ID_KEY) as
    | string
    | undefined;
  if (value) {
    return parseInt(value, 10);
  }
};

export const REDIRECT_KEY_PARAM = "redirect_page";

export const getRedirectUrl = (
  router: NextRouter,
): String | undefined => {
  const redirectValueEncoded = getQueryParam(router, REDIRECT_KEY_PARAM) as string | undefined;
  
  if (redirectValueEncoded) {
    return urlencode.decode(redirectValueEncoded);
  }
}

export const redirectToSignIn = (router: NextRouter) => {
  const redirectUrl = `${window.location.pathname}${window.location.search}`;
  const currentPathEncoded = urlencode.encode(redirectUrl);
  router.push({
    pathname: Routes.SignIn,
    query: `${REDIRECT_KEY_PARAM}=${currentPathEncoded}`,
  });
}
