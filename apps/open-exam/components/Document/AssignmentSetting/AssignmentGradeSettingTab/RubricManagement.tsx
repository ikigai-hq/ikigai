import { t, Trans } from "@lingui/macro";
import { CheckOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useTheme } from "styled-components";
import toast from "react-hot-toast";
import { v4 } from "uuid";
import { cloneDeep } from "lodash";

import { Drawer } from "components/common/Drawer";
import { Divider, Popconfirm, Tooltip, Typography } from "antd";
import { Button, TextButtonWithHover } from "components/common/Button";
import { useMutation, useQuery } from "@apollo/client";
import { GET_RUBRICS } from "graphql/query/AssignmentQuery";
import { handleError } from "graphql/ApolloClient";
import { GetRubrics, GetRubrics_orgGetRubrics as IRubric, RubricInput, RubricType, UpsertRubric } from "graphql/types";
import { formatDate, FormatType, getNowAsSec } from "util/Time";
import { REMOVE_RUBRIC, UPSERT_RUBRIC } from "graphql/mutation";
import useOrganizationStore from "context/ZustandOrganizationStore";
import { useState } from "react";
import EditRubric from "./EditRubric";
import useUserPermission from "hook/UseUserPermission";
import { Permission } from "util/permission";
import useAuthUserStore from "../../../../context/ZustandAuthStore";

export type BandScoresDrawerProps = {
  visible: boolean;
  onClose: () => void;
  selectedRubricId?: string;
  onChangeSelected?: (rubric: IRubric) => void;
};

const RubricManagement = (
  {
    selectedRubricId,
    onChangeSelected,
    visible,
    onClose,
  }: BandScoresDrawerProps
) => {
  const allow = useUserPermission();
  const theme = useTheme();
  const orgId = useAuthUserStore(state => state.currentUser?.userMe?.activeOrganization?.id);
  const { data: rubricsData, refetch } = useQuery<GetRubrics>(GET_RUBRICS, {
    onError: handleError,
  });
  const [addRubric, { loading }] = useMutation<UpsertRubric>(UPSERT_RUBRIC, {
    onError: handleError,
  });
  const [removeRubric] = useMutation(REMOVE_RUBRIC, {
    onError: handleError,
  });
  const [editingRubric, setEditingRubric] = useState<IRubric | undefined>();
  
  const onRemoveRubric = async (rubricId: string) => {
    const { data } = await removeRubric({ variables: { rubricId }});
    if (data) {
      await refetch();
      toast.success(t`Deleted!`);
    }
  };
  
  const onCreateRubric = async () => {
    const now = getNowAsSec();
    const defaultRubricData: RubricInput = {
      id: v4().toString(),
      orgId,
      name: `Rubric ${formatDate(now, FormatType.DateFormat)}`,
      data: {
        rubricType: RubricType.POINT_BASED,
        level: [],
        weightingCriteria: [],
        criteria: [],
        items: [],
      },
    };
    const { data } = await addRubric({
      variables: {
        rubric: defaultRubricData,
      },
    });
    
    if (data) {
      toast.success(t`Created!`);
      setEditingRubric(data.orgUpsertRubric);
      refetch();
    }
  };
  
  const rubrics = rubricsData?.orgGetRubrics || [];
  return (
    <Drawer
      title={t`Rubric Management`}
      open={visible}
      onClose={onClose}
      width={"40vw"}
    >
      <div>
        <Typography.Text type="secondary">
          <Trans>
            Rubrics consist of rows and columns.
            The rows correspond to the criteria.
            The columns correspond to the level of achievement that describes each criterion.
          </Trans>
        </Typography.Text>
        {
          allow(Permission.ManageClassContent) &&
          <Button
            type="primary"
            style={{
              width: "100%",
              marginTop: "15px",
            }}
            onClick={onCreateRubric}
            loading={loading}
            disabled={loading}
          >
            <Trans>Create new rubric</Trans>
          </Button>
        }
        <Divider />
        <div>
          {
            rubrics.map((rubric) => (
              <div key={rubric.id}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <div style={{ flex: 1 }}>
                    <Typography.Text
                      strong
                      style={{
                        color: rubric.id === selectedRubricId ? theme.colors.primary[7] : "black" ,
                      }}
                    >
                      {rubric.name}
                    </Typography.Text><br/>
                    <Typography.Text type="secondary">
                      {formatDate(rubric.createdAt, FormatType.DateTimeFormat)}
                    </Typography.Text>
                  </div>
                  <div style={{ display: "flex" }}>
                    <Tooltip
                      title={t`Use this rubric`}
                      arrow={false}
                    >
                      <TextButtonWithHover
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={() => onChangeSelected(rubric)}
                      />
                    </Tooltip>
                    <Tooltip
                      title={allow(Permission.ManageClassContent) ? t`View and Edit` : t`View`}
                      arrow={false}
                    >
                      <TextButtonWithHover
                        type="text"
                        icon={allow(Permission.ManageClassContent) ? <EditOutlined /> : <EyeOutlined />}
                        onClick={() => setEditingRubric(rubric)}
                      />
                    </Tooltip>
                    {
                      allow(Permission.ManageClassContent) &&
                      <Popconfirm
                        title={t`Do you want to remove ${rubric.name}?`}
                        onConfirm={() => onRemoveRubric(rubric.id)}
                      >
                        <TextButtonWithHover
                          type="text"
                          icon={<DeleteOutlined />}
                          style={{ color: "red" }}
                          disabled={loading}
                          loading={loading}
                        />
                      </Popconfirm>
                    }
                  </div>
                </div>
                <Divider />
              </div>
            ))
          }
        </div>
      </div>
      {
        editingRubric &&
        <EditRubric
          visible={!!editingRubric}
          onClose={() => {
            refetch();
            setEditingRubric(undefined);
          }}
          rubric={cloneDeep(editingRubric)}
        />
      }
    </Drawer>
  );
};

export default RubricManagement;
