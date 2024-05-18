import React from "react";
import EmptyState from "./EmptyState";
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

  onClickBackHome = () => {
    window.location.href = "/";
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
            content={t`Oops! We found an unexpected error...`}
          />
          <Button type="primary" onClick={this.onClickReload}>
            <Trans>Try to reload!</Trans>
          </Button>
          <Button onClick={this.onClickBackHome}>
            <Trans>Back to home</Trans>
          </Button>
        </div>
      );
    }

    // Return children components in case of no error

    return this.props.children;
  }
}

export default ErrorBoundary;
