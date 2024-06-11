import React from "react";
import Link from "next/link";
import { Trans } from "@lingui/macro";
import { Button } from "@radix-ui/themes";

import EmptyState from "components/EmptyState";

export default function PageNotFound() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <EmptyState
        hasMinHeight={false}
        content="We can't find the page you're looking for."
      />
      <Link href={"/"} passHref>
        <Button>
          <Trans>Back to home</Trans>
        </Button>
      </Link>
    </div>
  );
}
