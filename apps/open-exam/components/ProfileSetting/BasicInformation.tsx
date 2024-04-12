import React, { ChangeEvent } from "react";

import { AntDesignOutlined } from "@ant-design/icons";
import { Row, Col, Space, Avatar, Form } from "antd";
import styled, { useTheme } from "styled-components";

import { Button } from "components/common/Button";
import FileUpload from "components/common/FileUpload";
import { Text, TextWeight } from "components/common/Text";
import { FileUploadResponse } from "components/common/AddResourceModal";

import { Title, Input, Container, Box } from "./styles";
import { Trans, t } from "@lingui/macro";
import useAuthUserStore from "context/ZustandAuthStore";

export enum UserUpdateKeys {
  FIRST_NAME = "firstName",
  LAST_NAME = "lastName",
  AVATAR_FILE_ID = "avatarFileId",
  EMAIL = "email",
}

const AvatarContainer = styled(Space)`
  margin-bottom: 30px;
`;

export const ChangeAvatar = styled(Button)`
  padding: 5px 16px;
  border-color: unset;
`;

const DeleteAvatar = styled(Button)`
  padding: 5px 16px;
  &:hover {
    background: unset;
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 20px;
  }
`;

const BasicInformation = () => {
  const theme = useTheme();
  const { currentUser, updateInfo, setUpdatedUserData, updateUserData } =
    useAuthUserStore((state) => ({
      currentUser: state.currentUser,
      updateUserData: state.updateUserData,
      updateInfo: state.updateInfo,
      setUpdatedUserData: state.setUpdateUserData,
    }));

  const [form] = Form.useForm();

  const formFields = [
    {
      name: [UserUpdateKeys.FIRST_NAME],
      value: updateUserData?.firstName,
    },
    {
      name: [UserUpdateKeys.LAST_NAME],
      value: updateUserData?.lastName,
    },
  ];

  const onChangeUserData = (value: string | number, key: UserUpdateKeys) => {
    setUpdatedUserData({ [key]: value });
  };

  const handleAddFileUuid = (file: FileUploadResponse) => {
    onChangeUserData(file.uuid, UserUpdateKeys.AVATAR_FILE_ID);
    updateInfo({
      ...updateUserData,
      [UserUpdateKeys.AVATAR_FILE_ID]: file.uuid,
    });
  };

  const handleDeleteAvatar = () => {
    onChangeUserData(null, UserUpdateKeys.AVATAR_FILE_ID);
    updateInfo({ ...updateUserData, [UserUpdateKeys.AVATAR_FILE_ID]: null });
  };

  const onChangeFirstName = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeUserData(e.target.value, UserUpdateKeys.FIRST_NAME);
  };

  const onChangeLastName = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeUserData(e.target.value, UserUpdateKeys.LAST_NAME);
  };
  console.log("currentUSer", currentUser);
  return (
    <Container>
      <Title>
        <Trans>Basic Information</Trans>
      </Title>
      <Box>
        <AvatarContainer size={32}>
          <Avatar
            src={currentUser?.userMe.avatar?.publicUrl}
            size={146}
            icon={<AntDesignOutlined />}
          />
          <Space size={20} direction="vertical">
            <Space direction="vertical" size={4}>
              <Text
                color={theme.colors.gray[8]}
                level={4}
                weight={TextWeight.bold}
              >
                {`${currentUser?.userMe?.firstName} ${currentUser?.userMe?.lastName}`}
              </Text>
            </Space>
            <Space size={5}>
              <FileUpload handleAddFileUuid={handleAddFileUuid} isPublic={true}>
                <ChangeAvatar>
                  <Text color={theme.colors.gray[8]} level={2}>
                    <Trans>Change Avatar</Trans>
                  </Text>
                </ChangeAvatar>
              </FileUpload>
              <DeleteAvatar onClick={handleDeleteAvatar} type="text">
                <Text color={theme.colors.gray[7]} level={2}>
                  <Trans>Delete Avatar</Trans>
                </Text>
              </DeleteAvatar>
            </Space>
          </Space>
        </AvatarContainer>
        <StyledForm
          name="user-information"
          layout="vertical"
          initialValues={{
            firstName: updateUserData?.firstName,
            lastName: updateUserData?.lastName,
          }}
          fields={formFields}
          autoComplete="off"
          form={form}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                rules={[{ required: true }]}
                label={
                  <Text level={2} weight={TextWeight.medium}>
                    <Trans>First Name</Trans>
                  </Text>
                }
                name={UserUpdateKeys.FIRST_NAME}
              >
                <Input
                  onChange={onChangeFirstName}
                  placeholder={t`Enter first name`}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                rules={[{ required: true }]}
                label={
                  <Text level={2} weight={TextWeight.medium}>
                    <Trans>Last Name</Trans>
                  </Text>
                }
                name={UserUpdateKeys.LAST_NAME}
              >
                <Input
                  onChange={onChangeLastName}
                  placeholder={t`Enter last name`}
                />
              </Form.Item>
            </Col>
          </Row>
        </StyledForm>
      </Box>
    </Container>
  );
};

export default BasicInformation;
