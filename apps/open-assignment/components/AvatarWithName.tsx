import { Avatar, Tag, Typography } from "antd";
import { OrgRole } from "../graphql/types";
import { getRoleColor, getRoleName } from "../util";
import React from "react";
import {AvatarSize} from "antd/es/avatar/AvatarContext";

export type AvatarWithNameProps = {
  name: string;
  avtUrl: string | null;
  strong?: boolean;
  color?: string;
  role?: OrgRole;
  inline?: boolean;
  avatarSize?: AvatarSize;
  icon?: React.ReactNode;
};

const AvatarWithName = (props: AvatarWithNameProps) => {
  const shouldStrong = props.strong === undefined ? true : props.strong;
  return (
    <div style={{ display: props.inline ? "inline-block" : undefined }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {props.role && (
          <Tag style={{ marginRight: "5px" }} color={getRoleColor(props.role)}>
            {getRoleName(props.role)}
          </Tag>
        )}
        <span>
          <Avatar
            style={{ backgroundColor: props.color }}
            src={props.avtUrl}
            size={props.avatarSize}
            icon={props.icon}
          >
            {props.name.charAt(0)}
          </Avatar>
        </span>
        <span style={{ marginLeft: "5px" }}>
          <Typography.Text strong={shouldStrong}>{props.name}</Typography.Text>
        </span>
        <span></span>
      </div>
    </div>
  );
};

export default AvatarWithName;
