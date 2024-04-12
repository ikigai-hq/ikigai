import React, { useState } from "react";

import { Typography, Select } from "antd";
import styled from "styled-components";
import toast from "react-hot-toast";

import { Button } from "components/common/Button";
import { Input } from "components/common/Input";
import { AddOrgMember, AddUserData, OrgRole } from "graphql/types";
import validator from "validator";
import { useMutation } from "@apollo/client";
import { ADD_ORG_MEMBER } from "graphql/mutation";
import { handleError } from "graphql/ApolloClient";
import { Trans, t } from "@lingui/macro";
import IdentityInput from "./IdentityInput";

const InviteInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  display: flex;
  flex: 1;
  border: 1px solid #d6d9de;
  border-radius: 6px;
  align-items: stretch;
  flex-direction: column;
  margin-bottom: 10px;
`;

const InviteInput = styled(Input)`
  width: 80%;
  border: none;
  background: white;
`;

export type AddOrgMemberProps = {
  onAddOrgMember: (data: AddOrgMember) => Promise<void> | void;
};

const AddMember = (props: AddOrgMemberProps) => {
  const [addOrgMember, { loading }] = useMutation<AddOrgMember>(
    ADD_ORG_MEMBER,
    {
      onError: handleError,
    }
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [identity, setIdentity] = useState("");
  const [role, setRole] = useState(OrgRole.STUDENT);
  const [password, setPassword] = useState("");

  const onAdd = async () => {
    const data: AddUserData = {
      firstName,
      lastName,
      identity,
      orgRole: role,
      password: password ? password : null,
    };
    const { errors, data: addMemberData } = await addOrgMember({
      variables: { data },
    });

    if (!errors) {
      await props.onAddOrgMember(addMemberData);
      toast.success(t`Add org member successfully!`);
    }
  };

  const isValidPhoneOrEmail = (item: string) => {
    if (validator.isEmail(item)) return true;
    return validator.isMobilePhone(item);
  };

  const isValidPassword = (password: string) => {
    if (!password) return true;

    return password.length >= 8;
  };

  const disableAdd = !isValidPhoneOrEmail(identity) || !isValidPassword(password) || !firstName || !lastName;

  return (
    <>
      <InviteInputContainer>
        <Typography.Title level={5}>
          <Trans>Name</Trans>
        </Typography.Title>
        <InputContainer>
          <div style={{ display: "flex" }}>
            <InviteInput
              placeholder={t`First name`}
              value={firstName}
              onChange={(e) => setFirstName(e.currentTarget.value)}
              bordered={false}
            />
            <InviteInput
              placeholder={t`Last name`}
              bordered={false}
              value={lastName}
              onChange={(e) => setlastName(e.currentTarget.value)}
            />
          </div>
        </InputContainer>

        <Typography.Title level={5}>
          <Trans>Email or Phone Number</Trans>
        </Typography.Title>
        <IdentityInput
          defaultIdentity=""
          onChangeIdentity={setIdentity}
        />

        <Typography.Title level={5}>
          <Trans>Password</Trans>
        </Typography.Title>
        <Typography.Text type="secondary">
          <Trans>
            Password is optional. We will generate random password for
            user in case you don&lsquo;t provide this information
          </Trans>
        </Typography.Text>
        <Input.Password
          type="password"
          size="large"
          placeholder={t`Enter password`}
          visibilityToggle
          value={password}
          onChange={e => setPassword(e.currentTarget.value)}
        />

        <Typography.Title level={5}>
          <Trans>Role</Trans>
        </Typography.Title>
        <InputContainer>
          <Select
            defaultValue={role}
            bordered={false}
            size={"large"}
            onChange={setRole}
          >
            <Select.Option value={OrgRole.TEACHER}>
              <Trans>Teacher</Trans>
            </Select.Option>
            <Select.Option value={OrgRole.STUDENT}>
              <Trans>Student</Trans>
            </Select.Option>
          </Select>
        </InputContainer>
      </InviteInputContainer>
      <Button
        type="primary"
        style={{ float: "right" }}
        onClick={onAdd}
        disabled={disableAdd || loading}
        loading={loading}
      >
        <Trans>Add</Trans>
      </Button>
    </>
  );
};

export default AddMember;
