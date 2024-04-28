import { NextRouter } from "next/router";
import urlencode from "urlencode";
import { Routes } from "../config/Routes";

export const REDIRECT_KEY_PARAM = "redirect_page";

export const redirectToHome = (router: NextRouter) => {
  const redirectUrl = `${window.location.pathname}${window.location.search}`;
  const currentPathEncoded = urlencode.encode(redirectUrl);
  router.push({
    pathname: Routes.Home,
    query: `${REDIRECT_KEY_PARAM}=${currentPathEncoded}`,
  });
};
