import React from "react";

import { Button } from "antd";
import styled from "styled-components";

export const TransparentBtn = styled(Button)`
  & {
    background-color: transparent;
    border: transparent;

    :focus {
      background-color: transparent;
    }

    :hover {
      background-color: transparent;
    }
  }
`;
