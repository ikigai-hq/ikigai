import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import React from "react";
import styled from "styled-components";

export type UserNameProps = {
  name: string;
  email: string;
  randomColor: string;
  avatar?: string;
  onClick?: () => void;
};

const UserBasicInformation = (props: UserNameProps) => {
  const onClick = () => {
    if (props.onClick) props.onClick();
  };

  return (
    <UserInformation onClick={onClick}>
      <div>
        <Avatar
          icon={<UserOutlined />}
          src={props.avatar}
          style={{ backgroundColor: props.randomColor }}
        />
      </div>
      <div>
        <Typography.Text>{props.name}</Typography.Text>
        <br />
        <Typography.Text type="secondary" ellipsis>
          {props?.email || ""}
        </Typography.Text>
      </div>
    </UserInformation>
  );
};

const UserInformation = styled.div`
  padding: 0 15px 0 15px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  display: flex;
  gap: 10px;
  align-items: center;

  &:hover {
    background-color: #b8babd;
    cursor: pointer;
  }
`;

export default UserBasicInformation;
