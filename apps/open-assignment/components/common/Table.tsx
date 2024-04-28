import React from "react";

import { Table as TableAntd } from "antd";
import styled from "styled-components";

const Table = styled(TableAntd)`
  .ant-table-container {
    table {
      thead {
        tr:first-child {
          th:first-child {
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
          }
        }
        tr:last-child {
          th:last-child {
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
          }
        }
      }
    }
  }
  .ant-table-thead {
    .ant-table-cell {
      font-size: 14px;
      font-weight: 700;
      color: ${(props) => props.theme.colors.gray[7]};
      background: ${(props) => props.theme.colors.gray[11]};
      border-bottom: none;
    }
  }
  .ant-table-cell {
    border-color: ${(props) => props.theme.colors.gray[3]};
    &::before {
      display: none;
    }
  }
`;

export default Table;
