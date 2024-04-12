import React from "react";
import EmptyState from "../components/EmptyState";
import Link from "next/link";
import { Button } from "../components/common/Button";
import { Trans } from "@lingui/macro";

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
        <Button type="primary">
          <Trans>Back to home</Trans>
        </Button>
      </Link>
    </div>
  );
}
