import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import React from "react";
import styled from "styled-components";
import { AvatarSize } from "antd/es/avatar/AvatarContext";

export type UserNameProps = {
  name: string;
  randomColor?: string;
  email?: string;
  avatar?: string;
  onClick?: () => void;
  size?: AvatarSize;
};

const UserBasicInformation = (props: UserNameProps) => {
  const onClick = () => {
    if (props.onClick) props.onClick();
  };

  return (
    <UserInformation onClick={onClick}>
      <div>
        <Avatar
          size={props.size}
          icon={<UserOutlined />}
          src={props.avatar}
          style={{ backgroundColor: props.randomColor }}
        />
      </div>
      <div>
        <Typography.Text>{props.name}</Typography.Text>
        {props.email && (
          <>
            <br />
            <Typography.Text type="secondary" ellipsis>
              {props.email}
            </Typography.Text>
          </>
        )}
      </div>
    </UserInformation>
  );
};

const UserInformation = styled.div`
  padding: 4px 15px 4px 15px;
  border-radius: 8px;
  display: flex;
  gap: 10px;
  align-items: center;

  &:hover {
    background-color: #b8babd;
    cursor: pointer;
  }
`;

export default UserBasicInformation;
