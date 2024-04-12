import { Button, Card, Divider, Input, Typography } from "antd";
import { t, Trans } from "@lingui/macro";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import cloneDeep from "lodash/cloneDeep";
import toast from "react-hot-toast";

import useOrganizationStore from "context/ZustandOrganizationStore";
import { UPDATE_ORG_BRANDING } from "graphql/mutation";
import { handleError } from "graphql/ApolloClient";
import {UpdateOrg} from "graphql/types";

const BrandingSetting = () => {
  const organization = useOrganizationStore((state) => state.organization);
  const setOrganization = useOrganizationStore(
    (state) => state.setOrganization,
  );
  const [name, setName] = useState(organization?.orgName);

  const [updateOrgBranding, { loading }] = useMutation<UpdateOrg>(
    UPDATE_ORG_BRANDING,
    {
      onError: handleError,
      onCompleted: (data) => {
        toast.success(t`Updated!`);
        setOrganization(cloneDeep(data.orgUpdate));
      },
    },
  );

  const update = () => {
    if (!organization) return;

    updateOrgBranding({
      variables: {
        orgId: organization.id,
        data: {
          orgName: name,
        },
      },
    });
  };

  return (
    <div>
      <Card>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          <Trans>Organization General</Trans>
        </Typography.Title>
        <Divider />
        <div style={{ display: "flex", marginBottom: 15 }}>
          <div style={{ flex: 1 }}>
            <div>
              <Typography.Text strong>
                <Trans>Name</Trans>
              </Typography.Text>
              <Input
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                maxLength={100}
                minLength={3}
              />
              <Typography.Text type="secondary">
                <Trans>
                  Minimum length of organization name is 3. Maximum length of
                  organization name is 100.
                </Trans>
              </Typography.Text>
            </div>
          </div>
        </div>
        <Button
          type="primary"
          disabled={loading}
          loading={loading}
          onClick={update}
        >
          <Trans>Update</Trans>
        </Button>
      </Card>
    </div>
  );
};

export default BrandingSetting;
