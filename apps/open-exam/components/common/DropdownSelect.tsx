import React, { useState } from "react";

import { DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import styled, { useTheme } from "styled-components";

import { Text, TextWeight } from "components/common/Text";

interface Props {
  options: any;
  value?: any;
  onChange: (selected) => void;
  isSuffix?: boolean;
  width?: string;
}

const Selected = styled.div`
  cursor: pointer;
  gap: 8px;
  display: flex;
  align-items: center;

  svg {
    color: ${(props) => props.theme.colors.gray[8]};
    font-size: 11px;
    position: relative;
    top: 1px;
  }
`;

const DropdownSelect: React.FC<Props> = ({
  options,
  value,
  onChange,
  isSuffix,
  width,
}) => {
  const theme = useTheme();
  const [selected, setSelected] = useState(value || options[0]);

  const handleChange = (select) => {
    setSelected(select);
    onChange(select);
  };

  const items = (options || []).map((option) => ({
    key: option.value,
    label: option.label,
    onClick: () => handleChange(option),
  }));

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{ items: items, style: { minWidth: "auto !important" } }}
      overlayStyle={{ width }}
    >
      <Selected>
        <Text
          level={2}
          weight={isSuffix ? TextWeight.regular : TextWeight.medium}
          color={theme.colors.gray[8]}
        >
          {selected.label}
        </Text>
        <DownOutlined />
      </Selected>
    </Dropdown>
  );
};

export default DropdownSelect;
