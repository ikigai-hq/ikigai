import { Button, Col, Input, Row, Typography } from "antd";
import { t, Trans } from "@lingui/macro";
import { useState } from "react";
import { toast } from "react-hot-toast";
import styled from "styled-components";
import { useMutation } from "@apollo/client";

import useSpaceStore from "../../context/SpaceStore";
import { UPDATE_SPACE } from "graphql/mutation/SpaceMutation";
import { handleError } from "graphql/ApolloClient";
import { UpdateSpace } from "graphql/types";

const GeneralSpaceSetting = () => {
  const spaceId = useSpaceStore((state) => state.spaceId);
  const setSpaceName = useSpaceStore((state) => state.setSpaceName);
  const [innerSpaceName, setInnerSpaceName] = useState(
    useSpaceStore.getState().space?.name || "",
  );

  const [updateSpace, { loading }] = useMutation<UpdateSpace>(UPDATE_SPACE, {
    onError: handleError,
  });

  const onUpdateSpace = async () => {
    const { data } = await updateSpace({
      variables: {
        spaceId,
        data: {
          name: innerSpaceName,
          bannerId: undefined,
        },
      },
    });

    if (data) {
      toast.success(t`Updated!`);
      setSpaceName(innerSpaceName);
    }
  };

  return (
    <div>
      <div>
        <Row>
          <Col span={12}>
            <Typography.Text strong>
              <Trans>Space name</Trans>
            </Typography.Text>
            <Input
              value={innerSpaceName}
              onChange={(e) => setInnerSpaceName(e.currentTarget.value)}
              placeholder={t`Type space name...`}
            />
          </Col>
        </Row>
      </div>
      <UpdateButton
        type="primary"
        loading={loading}
        disabled={loading}
        onClick={onUpdateSpace}
      >
        <Trans>Update</Trans>
      </UpdateButton>
    </div>
  );
};

const UpdateButton = styled(Button)`
  margin-top: 15px;
`;

export default GeneralSpaceSetting;
