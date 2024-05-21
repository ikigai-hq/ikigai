import { t, Trans } from "@lingui/macro";
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useTheme } from "styled-components";
import toast from "react-hot-toast";
import { v4 } from "uuid";
import { cloneDeep } from "lodash";

import { Drawer } from "components/common/Drawer";
import { Divider, Popconfirm, Tooltip, Typography } from "antd";
import { Button, TextButtonWithHover } from "components/common/Button";
import { useMutation } from "@apollo/client";
import { handleError } from "graphql/ApolloClient";
import {
  RubricInput,
  RubricType,
  SpaceActionPermission,
  UpsertRubric,
} from "graphql/types";
import { formatTimestamp, FormatType, getNowAsSec } from "util/Time";
import {
  REMOVE_RUBRIC,
  UPSERT_RUBRIC,
} from "graphql/mutation/AssignmentMutation";
import { useState } from "react";
import EditRubric from "./EditRubric";
import usePermission from "hook/UsePermission";
import useRubricStore, { IRubric } from "store/RubricStore";

export type BandScoresDrawerProps = {
  visible: boolean;
  onClose: () => void;
  selectedRubricId?: string;
  onChangeSelected?: (rubric: IRubric) => void;
};

const RubricManagement = ({
  selectedRubricId,
  onChangeSelected,
  visible,
  onClose,
}: BandScoresDrawerProps) => {
  const allow = usePermission();
  const theme = useTheme();
  const rubrics = useRubricStore((state) => state.rubrics);
  const removeRubricStore = useRubricStore((state) => state.removeRubric);
  const addRubricStore = useRubricStore((state) => state.addOrUpdateRubric);
  const [addRubric, { loading }] = useMutation<UpsertRubric>(UPSERT_RUBRIC, {
    onError: handleError,
  });
  const [removeRubric] = useMutation(REMOVE_RUBRIC, {
    onError: handleError,
  });
  const [editingRubric, setEditingRubric] = useState<IRubric | undefined>();

  const onRemoveRubric = async (rubricId: string) => {
    const { data } = await removeRubric({ variables: { rubricId } });
    if (data) {
      removeRubricStore(rubricId);
      toast.success(t`Deleted!`);
    }
  };

  const onCreateRubric = async () => {
    const now = getNowAsSec();
    const defaultRubricData: RubricInput = {
      id: v4().toString(),
      name: `Rubric ${formatTimestamp(now, FormatType.DateFormat)}`,
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
      setEditingRubric(data.userUpsertRubric);
      addRubricStore(data.userUpsertRubric);
    }
  };

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
            Rubrics consist of rows and columns. The rows correspond to the
            criteria. The columns correspond to the level of achievement that
            describes each criterion.
          </Trans>
        </Typography.Text>
        {allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) && (
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
        )}
        <Divider />
        <div>
          {rubrics.map((rubric) => (
            <div key={rubric.id}>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <div style={{ flex: 1 }}>
                  <Typography.Text
                    strong
                    style={{
                      color:
                        rubric.id === selectedRubricId
                          ? theme.colors.primary[7]
                          : "black",
                    }}
                  >
                    {rubric.name}
                  </Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    {formatTimestamp(
                      rubric.createdAt,
                      FormatType.DateTimeFormat,
                    )}
                  </Typography.Text>
                </div>
                <div style={{ display: "flex" }}>
                  <Tooltip title={t`Use this rubric`} arrow={false}>
                    <TextButtonWithHover
                      type="text"
                      icon={<CheckOutlined />}
                      onClick={() => onChangeSelected(rubric)}
                    />
                  </Tooltip>
                  <Tooltip
                    title={
                      allow(SpaceActionPermission.MANAGE_SPACE_CONTENT)
                        ? t`View and Edit`
                        : t`View`
                    }
                    arrow={false}
                  >
                    <TextButtonWithHover
                      type="text"
                      icon={
                        allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) ? (
                          <EditOutlined />
                        ) : (
                          <EyeOutlined />
                        )
                      }
                      onClick={() => setEditingRubric(rubric)}
                    />
                  </Tooltip>
                  {allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) && (
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
                  )}
                </div>
              </div>
              <Divider />
            </div>
          ))}
        </div>
      </div>
      {editingRubric && (
        <EditRubric
          visible={!!editingRubric}
          onClose={() => {
            setEditingRubric(undefined);
          }}
          rubric={cloneDeep(editingRubric)}
        />
      )}
    </Drawer>
  );
};

export default RubricManagement;
