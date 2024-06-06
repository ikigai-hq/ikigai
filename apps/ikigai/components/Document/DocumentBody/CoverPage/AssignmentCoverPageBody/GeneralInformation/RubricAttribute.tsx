import { Flex, IconButton, Text } from "@radix-ui/themes";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { t } from "@lingui/macro";

import Modal from "components/base/Modal";
import RubricManagement from "components/Rubric/RubricManagement";
import useRubricStore from "store/RubricStore";
import { useState } from "react";

export type RubricAttributeProps = {
  rubricId?: string;
  onChangeRubricId: (rubricId?: string) => void;
  readOnly: boolean;
};

const RubricAttribute = ({
  rubricId,
  onChangeRubricId,
  readOnly,
}: RubricAttributeProps) => {
  const [openRubricManagement, setOpenRubricManagement] = useState(false);
  const rubric = useRubricStore((state) =>
    state.rubrics.find((rubric) => rubric.id === rubricId),
  );
  return (
    <div>
      <Flex align="center" gap="2">
        <Text>{rubric?.name || t`Not set`}</Text>
        {!readOnly && (
          <Modal
            title={t`Rubrics`}
            description={t`
            Rubrics consist of rows and columns. The rows correspond to the
            criteria. The columns correspond to the level of achievement that
            describes each criterion.
          `}
            content={
              <RubricManagement
                selectedRubricId={rubricId}
                onChangeSelected={(r) => {
                  setOpenRubricManagement(false);
                  onChangeRubricId(r.id);
                }}
              />
            }
            open={openRubricManagement}
            onOpenChange={setOpenRubricManagement}
          >
            <IconButton
              size="1"
              aria-label="Copy value"
              color="gray"
              variant="ghost"
            >
              <MixerHorizontalIcon />
            </IconButton>
          </Modal>
        )}
      </Flex>
    </div>
  );
};

export default RubricAttribute;
