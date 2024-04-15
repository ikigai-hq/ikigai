import React from "react";
import EmptyState from "./EmptyState";
import Link from "next/link";
import { Button } from "./common/Button";
import { Trans, t } from "@lingui/macro";

class ErrorBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI

    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can use your own error logging service here
    console.error("Catching Error", { error, errorInfo });
  }

  onClickReload = () => {
    window.location.reload();
  };

  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
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
            content={t`Oops! We found a error.`}
          />
          <Button type="primary" onClick={this.onClickReload}>
            <Trans>Try to reload!</Trans>
          </Button>
          <Link href={"/"} passHref>
            <Button>
              <Trans>Back to home</Trans>
            </Button>
          </Link>
        </div>
      );
    }

    // Return children components in case of no error

    return this.props.children;
  }
}

export default ErrorBoundary;
