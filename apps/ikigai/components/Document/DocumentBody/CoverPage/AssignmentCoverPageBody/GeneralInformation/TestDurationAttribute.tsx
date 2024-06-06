import { Flex, IconButton, RadioGroup, Text } from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import { isNil, round } from "lodash";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";

import Modal from "components/base/Modal";
import InputNumber from "components/base/InputNumber";

export type TestDurationAttributeProps = {
  testDuration: number | undefined;
  onChangeTestDuration: (testDuration: number | undefined) => void;
  readOnly: boolean;
};

const TestDurationAttribute = ({
  testDuration,
  onChangeTestDuration,
  readOnly,
}: TestDurationAttributeProps) => {
  const onChangeTestDurationOption = (value: string) => {
    if (value === "true") {
      onChangeTestDuration(1800);
    } else {
      onChangeTestDuration(undefined);
    }
  };

  return (
    <div>
      <Flex align="center" gap="2">
        {isNil(testDuration) && (
          <Text>
            <Trans>Unlimited</Trans>
          </Text>
        )}
        {!isNil(testDuration) && (
          <Text>
            {round(testDuration / 60)} <Trans>minutes</Trans>
          </Text>
        )}
        {!readOnly && (
          <Modal
            title={t`Test duration`}
            content={
              <div>
                <RadioGroup.Root
                  value={!isNil(testDuration) ? "true" : "false"}
                  onValueChange={onChangeTestDurationOption}
                >
                  <RadioGroup.Item value="true">Limited</RadioGroup.Item>
                  <RadioGroup.Item value="false">Unlimited</RadioGroup.Item>
                </RadioGroup.Root>
                <div>
                  {!isNil(testDuration) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 5,
                      }}
                    >
                      <InputNumber
                        value={testDuration / 60}
                        onChange={(e) => onChangeTestDuration((e || 0) * 60)}
                        precision={0}
                        size="1"
                        placeholder={t`Type minutes number...`}
                      />
                    </div>
                  )}
                </div>
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
    </div>
  );
};

export default TestDurationAttribute;
