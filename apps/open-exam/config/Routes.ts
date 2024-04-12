import slugid from "slugid";
import slugify from "slugify";

export enum Routes {
  Classes = "/",
  DocumentDetail = "/documents/:documentId",
  Organization = "/organization",
  SignIn = "/signin",
  ForgotPassword = "/forgot-password",
  ResetPassword = "/reset-password",
  MyAccount = "/profile/my-account",
  Trash = "/trash",
  SecuritySettings = "/profile/security-settings",
  NotFound = "/404",
}

export const isNonAuthenticatePage = (pathName: string): boolean => {
  // Standalone page
  if (nonAuthPathNameStandalone.includes(pathName)) {
    return true;
  }

  // Share Page
  return pathName.includes("/share/");
};

export const nonAuthPathNameStandalone: Array<string> = [
  Routes.SignIn,
  Routes.ForgotPassword,
  Routes.ResetPassword,
  Routes.NotFound,
];

export const formatDocumentRoute = (documentId: string) => {
  return Routes.DocumentDetail.replace(":documentId", documentId.toString());
};

export const formatPublicDocumentUrl = (
  documentUuid: string,
  documentTitle: string,
) => {
  const documentUuidEncoded = slugid.encode(documentUuid);
  const documentSlug = documentTitle
    ? `${slugify(documentTitle, {
        remove: /[*+~.()'"?!:@/]/g,
      })}-${documentUuidEncoded}`
    : documentUuidEncoded;
  return `${window.location.protocol}//${window.location.host}/share/documents/${documentSlug}`;
};

export function parseDocumentSlugId(url: string) {
  const docIdSuffixLength = 22;

  if (url.length < docIdSuffixLength) {
    return "";
  }

  return url.substring(url.length - docIdSuffixLength, url.length);
}

export const parsePublicDocumentUrl = (pathName: string) => {
  const slugId = parseDocumentSlugId(pathName);
  try {
    return slugid.decode(slugId);
  } catch (e) {
    console.error("Incorrect url");
    return "";
  }
};
