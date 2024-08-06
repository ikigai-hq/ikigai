import { Flex, IconButton, RadioGroup, Text } from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";

import Modal from "components/base/Modal";
import { GradeMethod } from "graphql/types";
import React from "react";

export type TestDurationAttributeProps = {
  gradeMethod: GradeMethod;
  onChangeGradeMethod: (gradeMethod: GradeMethod) => void;
  readOnly: boolean;
};

const GradeMethodAttribute = ({
  gradeMethod,
  onChangeGradeMethod,
  readOnly,
}: TestDurationAttributeProps) => {
  return (
    <div>
      <Flex align="center" gap="2">
        {GradeMethod.AUTO === gradeMethod && (
          <Text>
            <Trans>Auto</Trans>
          </Text>
        )}
        {GradeMethod.AUTO !== gradeMethod && (
          <Text>
            <Trans>Manual</Trans>
          </Text>
        )}
        {!readOnly && (
          <Modal
            title={t`Grade Method`}
            content={
              <div>
                <RadioGroup.Root
                  value={gradeMethod}
                  onValueChange={onChangeGradeMethod}
                >
                  <RadioGroup.Item value={GradeMethod.AUTO}>
                    Auto
                  </RadioGroup.Item>
                  <RadioGroup.Item value={GradeMethod.MANUAL}>
                    Manual
                  </RadioGroup.Item>
                </RadioGroup.Root>
              </div>
            }
          >
            <IconButton
              size="1"
              aria-label="Edit attribute"
              color="gray"
              variant="ghost"
            >
              <MixerHorizontalIcon />
            </IconButton>
          </Modal>
        )}
      </Flex>
      {GradeMethod.AUTO === gradeMethod && (
        <Text color="gray">
          <Trans>
            Students will receive the result and the correct answers immediately
            after completing their submissions.
          </Trans>
        </Text>
      )}
      {GradeMethod.MANUAL === gradeMethod && (
        <Text color="gray">
          <Trans>
            Students will receive the result and the correct answers after the
            teacher's feedback.
          </Trans>
        </Text>
      )}
    </div>
  );
};

export default GradeMethodAttribute;
