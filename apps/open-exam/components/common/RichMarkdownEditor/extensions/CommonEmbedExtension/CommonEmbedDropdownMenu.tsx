import { Dropdown, MenuProps, Typography } from "antd";
import { ReactNode } from "react";
import { Trans } from "@lingui/macro";

export type CommonEmbedDropdownMenuProps = {
  onDelete: () => void;
  children: ReactNode;
};

const CommonEmbedDropDownMenu: React.FC<CommonEmbedDropdownMenuProps> = ({
  children,
  onDelete,
}) => {
  const items: MenuProps["items"] = [
    {
      key: "2",
      onClick: onDelete,
      label: (
        <Typography.Text type="danger">
          <Trans>Delete</Trans>
        </Typography.Text>
      ),
    },
  ];

  return (
    <Dropdown
      placement="bottom"
      trigger={["click"]}
      overlayStyle={{ width: "180px" }}
      menu={{ items }}
    >
      {children}
    </Dropdown>
  );
};

export default CommonEmbedDropDownMenu;
