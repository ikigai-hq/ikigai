import * as Sentry from "@sentry/browser";

export const ignoreSentryError = () => {
  Sentry.withScope((scope) => {
    scope.setExtra("ignoreError", true);
  });
};
