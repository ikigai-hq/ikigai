import React, { useEffect, useState } from "react";
import { t, Trans } from "@lingui/macro";
import { useRouter } from "next/router";

import PageTitle from "components/common/PageTitle";
import { Tabs } from "components/common/Tabs";
import { Button } from "components/common/Button";
import AddOrgMember from "./AddOrgMemberModal";
import Loading from "../Loading";
import useAuthUserStore from "context/ZustandAuthStore";
import OrganizationMembersTab from "./OrganizationMembersTab";
import useOrganizationStore, { useLoadOrganizationMembers } from "context/ZustandOrganizationStore";
import useUserPermission from "hook/UseUserPermission";
import { Permission } from "util/permission";
import BrandingSetting from "./BrandingSetting";

const TAB_KEYS = ["members", "branding"];

const Organization = () => {
  const router = useRouter();
  const authUser = useAuthUserStore((state) => state.currentUser);
  const org = useOrganizationStore(state => state.organization);
  const [activeTab, setActiveTab] = useState(TAB_KEYS[0]);
  const [openAddOrgMemberModal, setOpenAddOrgMemberModal] = useState(false);
  const { fetch } = useLoadOrganizationMembers();
  const allow = useUserPermission();
  
  useEffect(() => {
    if (router?.isReady) {
      const currentTab = router.query.tab as string;
      setActiveTab(TAB_KEYS.includes(currentTab) ? currentTab : TAB_KEYS[0]);
    }
  }, [router?.isReady]);
  
  const onChangeTab = (tab: string) => {
    router.push({query: { tab }}, undefined, { shallow: true });
    setActiveTab(tab);
  };
  
  const items = [
    {
      key: TAB_KEYS[0],
      label: t`Members`,
      children: <OrganizationMembersTab />,
    },
  ];
  
  if (allow(Permission.ManageOrgInformation)) {
    items.push({
      key: TAB_KEYS[2],
      label: t`Branding`,
      children: <BrandingSetting />,
    });
  }
  
  if (!org || !authUser) {
    return <Loading />;
  }
  
  const extraActions = () => {
    if (activeTab === TAB_KEYS[0] && allow(Permission.AddOrgMember)) {
      return (
        <div
          style={{ display: "flex" }}
        >
          <Button type="primary" onClick={() => setOpenAddOrgMemberModal(true)}>
            <Trans>Add member</Trans>
          </Button>
        </div>
      );
    }
    
    return <></>;
  };

  return (
    <div>
      <PageTitle readOnly={true} title={org?.orgName} isBack={false} />
      <Tabs
        tabBarExtraContent={extraActions()}
        onChange={onChangeTab}
        activeKey={activeTab}
        accessKey={activeTab}
        items={items}
      />
      <AddOrgMember
        visible={openAddOrgMemberModal}
        onClose={async () => {
          fetch();
          setOpenAddOrgMemberModal(false);
        }}
      />
    </div>
  );
};

export default Organization;
