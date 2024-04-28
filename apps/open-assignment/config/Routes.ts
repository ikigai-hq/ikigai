import slugid from "slugid";
import slugify from "slugify";

export enum Routes {
  Home = "/",
  DocumentDetail = "/documents/:documentId",
  PreJoinSpace = "/spaces/:spaceId/join/:token",
  NotFound = "/404",
}

export const formatDocumentRoute = (documentId: string) => {
  return Routes.DocumentDetail.replace(":documentId", documentId.toString());
};

export const formatPreJoinSpaceUrl = (spaceId: number, token: string) => {
  const path = Routes.PreJoinSpace
    .replace(":spaceId", spaceId.toString())
    .replace(":token", token);
  return `${window.location.protocol}//${window.location.host}${path}`;
}

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
