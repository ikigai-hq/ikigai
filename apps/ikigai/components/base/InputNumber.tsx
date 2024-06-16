import React, { ChangeEvent, useState } from "react";

import { TextField } from "@radix-ui/themes";
import { round } from "lodash";

export type InputNumberProps = {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  precision?: number;
  size?: "1" | "2" | "3";
  readOnly?: boolean;
};

const InputNumber = ({
  icon,
  placeholder,
  value,
  onChange,
  precision,
  size,
  readOnly = false,
}: InputNumberProps) => {
  const [innerValue, setInnerValue] = useState<number | undefined>(value);

  const onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.currentTarget.value !== "") {
        let value = parseFloat(e.currentTarget.value.trim());
        if (precision !== undefined) {
          value = round(value, precision);
        }
        if (!Number.isNaN(value)) {
          onChange(value);
          setInnerValue(value);
        }
      } else {
        onChange(0);
        setInnerValue(undefined);
      }
    } catch (e) {
      console.warn(`Cannot parse value ${innerValue} to number`);
    }
  };

  return (
    <TextField.Root
      size={size}
      type="number"
      placeholder={placeholder}
      value={innerValue}
      onChange={onChangeValue}
      readOnly={readOnly}
    >
      <TextField.Slot>{icon}</TextField.Slot>
    </TextField.Root>
  );
};

export default InputNumber;
