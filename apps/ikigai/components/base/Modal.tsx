import React from "react";
import { Dialog, Flex, Button, Box } from "@radix-ui/themes";

export type ModalProps = {
  children: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  content: React.ReactNode;
  onOk?: () => void | Promise<void>;
  okText?: React.ReactNode;
};

const Modal = ({
  children,
  title,
  description,
  content,
  onOk,
  okText,
}: ModalProps) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>

        <Box pb="3">{content}</Box>

        <Flex gap="3" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Close
            </Button>
          </Dialog.Close>
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
