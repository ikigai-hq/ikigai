import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";
import { v4 } from "uuid";
import { cloneDeep } from "lodash";
import { CheckIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import {
  AlertDialog,
  Button,
  Flex,
  IconButton,
  ScrollArea,
  Separator,
  Text,
} from "@radix-ui/themes";

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
import ViewOrEditRubric from "./ViewOrEditRubric";
import usePermission from "hook/UsePermission";
import useRubricStore, { IRubric } from "store/RubricStore";

export type BandScoresDrawerProps = {
  selectedRubricId?: string;
  onChangeSelected?: (rubric: IRubric) => void;
};

const RubricManagement = ({
  selectedRubricId,
  onChangeSelected,
}: BandScoresDrawerProps) => {
  const allow = usePermission();
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
    <>
      <div>
        {allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) && (
          <Button
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
        <Separator />
        <ScrollArea
          type="always"
          scrollbars="vertical"
          style={{ height: "30vh" }}
        >
          <div style={{ paddingRight: 10 }}>
            {rubrics.map((rubric) => (
              <div key={rubric.id} style={{ marginTop: 5, marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <Text
                      color={
                        rubric.id === selectedRubricId ? "amber" : undefined
                      }
                      weight="bold"
                    >
                      {rubric.name}
                    </Text>
                    <br />
                    <Text size="1" weight="light" color={"gray"}>
                      {formatTimestamp(
                        rubric.createdAt,
                        FormatType.DateTimeFormat,
                      )}
                    </Text>
                  </div>
                  <div
                    style={{ display: "flex", gap: 4, alignContent: "center" }}
                  >
                    <IconButton
                      color="gray"
                      variant="soft"
                      onClick={() => onChangeSelected(rubric)}
                    >
                      <CheckIcon width="18" height="18" />
                    </IconButton>
                    <IconButton
                      color="gray"
                      variant="soft"
                      onClick={() => setEditingRubric(rubric)}
                    >
                      <Pencil1Icon width="18" height="18" />
                    </IconButton>
                    <AlertDialog.Root>
                      <AlertDialog.Trigger>
                        <IconButton color="red" variant="soft">
                          <TrashIcon width="18" height="18" />
                        </IconButton>
                      </AlertDialog.Trigger>
                      <AlertDialog.Content maxWidth="450px">
                        <AlertDialog.Description size="2">
                          <Trans>
                            Are you sure? This rubric will no longer be
                            accessible.
                          </Trans>
                        </AlertDialog.Description>
                        <Flex gap="3" mt="4" justify="end">
                          <AlertDialog.Cancel>
                            <Button variant="soft" color="gray">
                              Cancel
                            </Button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action
                            onClick={() => onRemoveRubric(rubric.id)}
                          >
                            <Button variant="solid" color="red">
                              Remove
                            </Button>
                          </AlertDialog.Action>
                        </Flex>
                      </AlertDialog.Content>
                    </AlertDialog.Root>
                  </div>
                </div>
                <Separator style={{ width: "100%" }} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      {editingRubric && (
        <ViewOrEditRubric
          open={!!editingRubric}
          onOpenChange={(open) => {
            if (!open) {
              setEditingRubric(undefined);
            }
          }}
          rubric={cloneDeep(editingRubric)}
        >
          <></>
        </ViewOrEditRubric>
      )}
    </>
  );
};

export default RubricManagement;
