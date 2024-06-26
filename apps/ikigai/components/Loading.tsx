import React from "react";

import { Spinner } from "@radix-ui/themes";

const Loading = () => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Spinner />
    </div>
  );
};

export default Loading;
