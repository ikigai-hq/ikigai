import React from "react";
import { Typography, Divider } from "antd";
import { Trans, t } from "@lingui/macro";
import { toast } from "react-hot-toast";

import { Title, Container, Box } from "./styles";
import { UpdateMemberNote, UserMe_userMe_activeOrgMember as IMember } from "graphql/types";
import { useMutation } from "@apollo/client";
import { UPDATE_ORG_MEMBER } from "graphql/mutation";
import { handleError } from "graphql/ApolloClient";
import { Button } from "../common/Button";

export type OrganizationProfileEditProps = {
  organizationProfile: IMember;
}

const OrganizationProfileEdit = ({ organizationProfile }: OrganizationProfileEditProps) => {
  const [updateOrgMember, { loading }] = useMutation<UpdateMemberNote>(UPDATE_ORG_MEMBER, {
    onError: handleError,
  });
  
  const onSaveOrganizationProfile = async () => {
    const { data } = await updateOrgMember({
      variables: {
        orgMember: {
          orgId: organizationProfile.orgId,
          userId: organizationProfile.userId,
          orgRole: organizationProfile.orgRole,
        },
      },
    });
    
    if (data) toast.success(t`Updated!`);
  };
  
  return (
    <Container>
      <Title>
        <Trans>Organization Profile</Trans>
      </Title>
      <Typography.Text type="secondary">
        Organization profile will override your basic profile in this organization.
      </Typography.Text>
      <Divider />
      <Box>
        <div style={{ width: "100%" }}>
          <Button
            type="primary"
            style={{ marginTop: "20px" }}
            onClick={onSaveOrganizationProfile}
            loading={loading}
            disabled={loading}
          >
            <Trans>Save</Trans>
          </Button>
        </div>
      </Box>
    </Container>
  );
};

export default OrganizationProfileEdit;
