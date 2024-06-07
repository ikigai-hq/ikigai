import { AlertDialog, Button, Flex, IconButton } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";
import { t, Trans } from "@lingui/macro";
import React from "react";

export type IkigaiAlertDialogProps = {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
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
}: IkigaiAlertDialogProps) => {
  return (
    <AlertDialog.Root>
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
            <Button variant="solid" color="red">
              {confirmText}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

export default IkigaiAlertDialog;
