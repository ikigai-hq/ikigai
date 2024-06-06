import { Flex, IconButton, RadioGroup, Text } from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import { isNil } from "lodash";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";

import Modal from "components/base/Modal";
import InputNumber from "components/base/InputNumber";

export type TestDurationAttributeProps = {
  attemptNumber: number | undefined;
  onChangeAttemptNumber: (attemptNumber: number | undefined) => void;
  readOnly: boolean;
};

const AttemptAttribute = ({
  attemptNumber,
  onChangeAttemptNumber,
  readOnly,
}: TestDurationAttributeProps) => {
  const onChangeAttemptNumberOption = (value: string) => {
    if (value === "true") {
      onChangeAttemptNumber(1);
    } else {
      onChangeAttemptNumber(undefined);
    }
  };

  return (
    <div>
      <Flex align="center" gap="2">
        {isNil(attemptNumber) && (
          <Text>
            <Trans>Unlimited</Trans>
          </Text>
        )}
        {!isNil(attemptNumber) && (
          <Text>
            {attemptNumber} <Trans>times</Trans>
          </Text>
        )}

        {!readOnly && (
          <Modal
            title={t`Max Attempt`}
            content={
              <div>
                <RadioGroup.Root
                  value={!isNil(attemptNumber) ? "true" : "false"}
                  onValueChange={onChangeAttemptNumberOption}
                >
                  <RadioGroup.Item value="true">Limited</RadioGroup.Item>
                  <RadioGroup.Item value="false">Unlimited</RadioGroup.Item>
                </RadioGroup.Root>
                <div>
                  {!isNil(attemptNumber) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 5,
                      }}
                    >
                      <InputNumber
                        value={attemptNumber}
                        onChange={onChangeAttemptNumber}
                        precision={0}
                        size="1"
                        placeholder={t`Type maximum attempt number...`}
                      />
                    </div>
                  )}
                </div>
              </div>
            }
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

export default AttemptAttribute;
