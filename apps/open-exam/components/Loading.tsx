import React from "react";

import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useTheme } from "styled-components";

const Loading = (props) => {
  const theme = useTheme();
  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        color: theme.colors.blue[5],
        ...props.style,
      }}
    >
      <Spin
        indicator={
          <LoadingOutlined
            style={{ fontSize: 24, color: theme.colors.blue[5] }}
            spin
          />
        }
      />
    </div>
  );
};

export default Loading;
