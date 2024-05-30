import React from "react";
import { Popover } from "@radix-ui/themes";
import { PopoverContentProps } from "@radix-ui/react-popover";

export type IkigaiPopoverProps = {
  children: React.ReactNode;
  // Ref: https://www.radix-ui.com/themes/docs/components/popover
  content: React.ReactNode;
  contentProps?: PopoverContentProps;
  width?: string;
};

const IkigaiPopover = ({
  children,
  content,
  contentProps,
  width,
}: IkigaiPopoverProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content {...contentProps} width={width || "300px"}>
        {content}
      </Popover.Content>
    </Popover.Root>
  );
};

export default IkigaiPopover;
