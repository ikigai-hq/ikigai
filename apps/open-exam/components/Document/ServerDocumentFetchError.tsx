import { Button, Result } from "antd";
import { t, Trans } from "@lingui/macro";
import React from "react";

export type ServerDocumentFetchErrorProps = {
  fetchError: string;
  showBackToHome: boolean;
};

const ServerDocumentFetchError = ({ fetchError, showBackToHome }: ServerDocumentFetchErrorProps) => {
  return (
    <div>
      <Result
        status="warning"
        title={t`There are some problems with this document. ${fetchError}`}
        extra={
          <div>
            <Button
              type="primary"
              onClick={() => window.location.reload()}
              style={{ marginRight: "5px" }}
            >
              <Trans>Reload</Trans>
            </Button>
            {
              showBackToHome &&
              <Button onClick={() => window.location.pathname = "/"}>
                <Trans>Back to home</Trans>
              </Button>
            }
          </div>
        }
      />
    </div>
  );
};

export default ServerDocumentFetchError;
