import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { NotificationInstance } from 'antd/es/notification/interface';
import { t } from "@lingui/macro";
import { ReactNode } from "react";

let message: MessageInstance;
let notification: NotificationInstance;
let modal: Omit<ModalStaticFunctions, 'warn'>;

export const useModal = () => {
  const staticFunction = App.useApp();
  message = staticFunction.message;
  modal = staticFunction.modal;
  notification = staticFunction.notification;

  return { message, modal, notification };
};

export const quickConfirmModal = (
  modal: Omit<ModalStaticFunctions, 'warn'>,
  title: ReactNode,
  onOk: () => void | Promise<void>,
  okCancel?: boolean,
) => {
  modal.confirm({
    zIndex: 1100,
    title: title,
    okButtonProps: {
      type: "primary",
    },
    bodyStyle: {
      padding: "32px 32px 24px 32px",
    },
    onOk: onOk,
    okCancel,
  });
}
