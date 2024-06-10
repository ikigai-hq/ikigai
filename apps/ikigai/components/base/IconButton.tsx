import React from "react";
import { IconButton } from "@radix-ui/themes";
import { IconButtonProps } from "@radix-ui/themes/src/components/icon-button";

export type IkigaiIconButtonProps = {
  isActive?: boolean;
} & IconButtonProps;

const IkigaiIconButton = (props: IkigaiIconButtonProps) => {
  return (
    <IconButton
      {...props}
      style={{
        cursor: "pointer",
        backgroundColor: props.isActive ? "#E6F4FE" : "unset",
      }}
    >
      {props.children}
    </IconButton>
  );
};

export default IkigaiIconButton;
