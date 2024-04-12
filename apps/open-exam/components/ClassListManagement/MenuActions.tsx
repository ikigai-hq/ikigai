import React, { useState } from "react";

import { MoreOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Dropdown, Tooltip } from "antd";
import toast from "react-hot-toast";

import { Text } from "components/common/Text";
import { handleError } from "graphql/ApolloClient";
import {
  SOFT_DELETE_CLASS,
  DUPLICATE_CLASS,
} from "graphql/mutation/ClassMutation";
import { ConfirmPopup } from "util/ConfirmPopup";
import { Trans, t } from "@lingui/macro";
import { useModal } from "hook/UseModal";
import { useTheme } from "styled-components";
import { GetMyClasses_classGetMyClasses as ClassItem } from "graphql/types";

interface Props {
  classItem: ClassItem;
  refetch: () => void;
}

export const MenuActions: React.FC<Props> = ({ classItem, refetch }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const { modal } = useModal();
  const [duplicateClass] = useMutation(DUPLICATE_CLASS, {
    onError: handleError,
  });

  const [deleteClass] = useMutation(SOFT_DELETE_CLASS, {
    onError: handleError,
    onCompleted: () => {
      refetch();
      toast.success(t`Deleted successfully!`);
    },
  });

  const handleHide = () => {
    setIsVisible(false);
  };

  const handleOpen = (event) => {
    event.stopPropagation();
    setIsVisible(true);
  };

  const handleDuplicateClass = async () => {
    await toast.promise(
      duplicateClass({ variables: { classId: classItem.id } }),
      {
        loading: t`Duplicating...`,
        success: t`Duplicated!`,
        error: t`Cannot duplicate class`,
      },
    );
    refetch();
  };

  const handleDelete = async () => {
    modal.confirm(
      ConfirmPopup({
        title: t`Confirm Delete Class`,
        content: t`Are you sure to delete this class?`,
        onOk: () => {
          deleteClass({ variables: { classId: classItem.id } });
        },
      }) as any,
    );
    handleHide();
  };

  return (
    <Dropdown
      menu={{
        items: [
          { key: "2", label: t`Duplicate`, onClick: handleDuplicateClass },
          {
            key: "4",
            label: (
              <Text level={2} color={theme.colors.red[4]}>
                <Trans>Delete</Trans>
              </Text>
            ),
            onClick: handleDelete,
          },
        ],
      }}
      placement="bottomRight"
      trigger={["click"]}
      open={isVisible}
      onOpenChange={setIsVisible}
    >
      <Tooltip title={t`Options`} arrow={false}>
        <MoreOutlined
          style={{
            fontSize: "16px",
            color: "white",
            position: "relative",
          }}
          onClick={handleOpen}
        />
      </Tooltip>
    </Dropdown>
  );
};
