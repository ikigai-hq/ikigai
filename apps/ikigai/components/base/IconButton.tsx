import React from "react";
import { IconButton } from "@radix-ui/themes";
import { IconButtonProps } from "@radix-ui/themes/src/components/icon-button";

export type IkigaiIconButtonProps = {
  isActive?: boolean;
} & IconButtonProps;

const IkigaiIconButton = (props: IkigaiIconButtonProps) => {
  const { isActive, ...remainingProps } = props;
  return (
    <IconButton
      {...remainingProps}
      style={{
        cursor: "pointer",
        backgroundColor: isActive ? "#E6F4FE" : "unset",
      }}
    >
      {props.children}
    </IconButton>
  );
};

export default IkigaiIconButton;
