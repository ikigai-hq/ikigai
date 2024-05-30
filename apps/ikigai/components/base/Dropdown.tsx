import { DropdownMenu } from "@radix-ui/themes";
import React from "react";

export type IkigaiDropdownProps = {
  children: React.ReactNode;
  // Ref: https://www.radix-ui.com/themes/docs/components/dropdown-menu
  content: React.ReactNode;
};

const IkigaiDropdown = ({ children, content }: IkigaiDropdownProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Content>{content}</DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default IkigaiDropdown;
