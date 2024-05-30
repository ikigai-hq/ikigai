import React from "react";
import { IconButton } from "@radix-ui/themes";
import { IconButtonProps } from "@radix-ui/themes/src/components/icon-button";

export type IkigaiIconButtonProps = {
  active?: boolean;
} & IconButtonProps;

const IkigaiIconButton = (props: IkigaiIconButtonProps) => {
  return (
    <IconButton
      {...props}
      style={{
        cursor: "pointer",
        backgroundColor: props.active ? "#E6F4FE" : "unset",
      }}
    >
      {props.children}
    </IconButton>
  );
};

export default IkigaiIconButton;
