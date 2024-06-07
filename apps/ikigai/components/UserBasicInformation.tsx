import React from "react";
import styled from "styled-components";
import { Avatar, Button, Text } from "@radix-ui/themes";

export type UserNameProps = {
  name: string;
  randomColor?: string;
  email?: string;
  avatar?: string;
  onClick?: () => void;
};

const UserBasicInformation = (props: UserNameProps) => {
  const onClick = () => {
    if (props.onClick) props.onClick();
  };

  return (
    <UserInformation size="2" onClick={onClick} variant="ghost">
      <div>
        <Avatar
          radius="full"
          fallback={props.name.charAt(0)}
          src={props.avatar}
          size="2"
        />
      </div>
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Text size="1" style={{ color: "black" }} weight="medium" truncate>
          {props.name}
        </Text>
        {props.email && (
          <>
            <br />
            <Text size="1" color="gray" truncate>
              {props.email}
            </Text>
          </>
        )}
      </div>
    </UserInformation>
  );
};

const UserInformation = styled(Button)`
  display: flex;
  align-items: center;
  max-width: 200px;

  &:hover {
    cursor: pointer;
  }
`;

export default UserBasicInformation;
