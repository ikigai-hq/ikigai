import React from "react";
import { Dialog, Flex, Button, Box, Text } from "@radix-ui/themes";

export type ModalProps = {
  children?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  content: React.ReactNode;
  onOk?: () => void | Promise<void>;
  okText?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  minWidth?: string;
  maxWidth?: string;
  showClose?: boolean;
};

const Modal = ({
  children,
  title,
  description,
  content,
  onOk,
  okText,
  open,
  onOpenChange,
  minWidth,
  maxWidth,
  showClose = true,
}: ModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children && <Dialog.Trigger>{children}</Dialog.Trigger>}
      <Dialog.Content minWidth={minWidth} maxWidth={maxWidth}>
        {title && <Dialog.Title>{title}</Dialog.Title>}
        {description && (
          <Dialog.Description>
            <Text color="gray" size="2">
              {description}
            </Text>
          </Dialog.Description>
        )}

        <Box pb="3">{content}</Box>

        <Flex gap="3" justify="end">
          {showClose && (
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Close
              </Button>
            </Dialog.Close>
          )}
          {onOk && (
            <Dialog.Close>
              <Button onClick={onOk}>{okText || "Save"}</Button>
            </Dialog.Close>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default Modal;
