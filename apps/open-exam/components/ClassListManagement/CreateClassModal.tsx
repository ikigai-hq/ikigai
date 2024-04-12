import { ChangeEvent, useState } from "react";

import { Form } from "antd";
import styled, { useTheme } from "styled-components";

import { Button } from "components/common/Button";
import { Input } from "components/common/Input";
import Modal from "components/common/Modal";
import { Text, TextWeight } from "components/common/Text";
import { Trans, t } from "@lingui/macro";
import { useMutation } from "@apollo/client";
import { CreateClass } from "graphql/types";
import { CREATE_CLASS } from "graphql/mutation/ClassMutation";
import { handleError } from "graphql/ApolloClient";
import { useRouter } from "next/router";
import {formatDocumentRoute} from "config/Routes";

const { Item } = Form;

export type CreateClassModalProps = {
  visible: boolean;
  onClose: () => void;
};

const ButtonContinue = styled(Button)`
  min-width: 176px;
  margin-left: auto;
`;

const CreateClassModal = ({ onClose, visible }: CreateClassModalProps) => {
  const theme = useTheme();
  const router = useRouter();

  const [createClass] = useMutation<CreateClass>(CREATE_CLASS, {
    onError: handleError,
    onCompleted: (value) => {
      router.push({
        pathname: formatDocumentRoute(value.classCreate.starterDocument.documentId),
      });
    },
  });

  const [value, setValue] = useState<{ [name: string]: string }>({
    title: "",
    category: "",
  });

  const handleInputChange =
    (name: string) => (event: ChangeEvent<HTMLInputElement>) => {
      setValue({ ...value, [name]: event.target.value });
    };

  const handleCreateClass = async () => {
    return await createClass({
      variables: {
        data: {
          name: value.title,
          category: value.category,
        },
      },
    });
  };

  return (
    <Modal
      visible={visible}
      title={<Trans>Create New Class</Trans>}
      onClose={onClose}
    >
      <Form
        name="CreateClass"
        layout="vertical"
        initialValues={{ title: "", category: "" }}
        autoComplete="off"
        onFinish={handleCreateClass}
      >
        <Item
          label={
            <Text
              level={2}
              weight={TextWeight.medium}
              color={theme.colors.blue[9]}
            >
              <Trans>How about class title?</Trans>
            </Text>
          }
          rules={[{ required: true, max: 512 }]}
          name="title"
        >
          <Input
            placeholder={t`Type your class name...`}
            value={value.title}
            onChange={handleInputChange("title")}
          />
        </Item>

        <Item style={{ marginBottom: 0, marginTop: "48px" }}>
          <ButtonContinue type="primary" htmlType="submit">
            <Trans>Continue</Trans>
          </ButtonContinue>
        </Item>
      </Form>
    </Modal>
  );
};

export default CreateClassModal;
