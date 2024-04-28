import React from "react";

interface SpacerProps {
  size?: number;
  column?: boolean;
}

const Spacer = ({ size = 10, column = false }: SpacerProps) => (
  <div
    style={{
      height: size,
      width: size,
      display: column ? "inline-block" : "inherit",
    }}
  />
);

export default Spacer;
