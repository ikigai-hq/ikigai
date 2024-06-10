import { AlertDialog, Button, Flex, IconButton } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";
import { t, Trans } from "@lingui/macro";
import React from "react";

export type BaseColors =
  | "gray"
  | "gold"
  | "bronze"
  | "brown"
  | "yellow"
  | "amber"
  | "orange"
  | "tomato"
  | "red"
  | "ruby"
  | "crimson"
  | "pink"
  | "plum"
  | "purple"
  | "violet"
  | "iris"
  | "indigo"
  | "blue"
  | "cyan"
  | "teal"
  | "jade"
  | "green"
  | "grass"
  | "lime"
  | "mint"
  | "sky";

export type IkigaiAlertDialogProps = {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  open?: boolean;
  onOpenChanged?: (open: boolean) => void;
  confirmText?: string;
  confirmColor?: BaseColors;
  children?: React.ReactNode;
};

const IkigaiAlertDialog = ({
  title,
  description,
  onConfirm,
  children = (
    <IconButton color="red" size="1">
      <TrashIcon />
    </IconButton>
  ),
  confirmText = t`Remove`,
  confirmColor = "red",
  open,
  onOpenChanged,
}: IkigaiAlertDialogProps) => {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChanged}>
      <AlertDialog.Trigger>{children}</AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description size="2">
          {description}
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              <Trans>Cancel</Trans>
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action onClick={onConfirm}>
            <Button variant="solid" color={confirmColor}>
              {confirmText}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

export default IkigaiAlertDialog;
