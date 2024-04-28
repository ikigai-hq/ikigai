import React from "react";

import { Pagination as AntdPagination } from "antd";

interface Props {
  total: number;
  currentPage: number;
  onChange: (page: number, pageSize?: number) => void;
  defaultPageSize?: number;
  pageSize?: number;
  pageSizeOptions?: string[];
}

export const Pagination: React.FC<Props> = ({
  total,
  currentPage,
  defaultPageSize,
  pageSize,
  onChange,
  pageSizeOptions,
}) => {
  return (
    <AntdPagination
      total={total}
      defaultPageSize={defaultPageSize}
      current={currentPage}
      pageSize={pageSize}
      onChange={onChange}
      pageSizeOptions={pageSizeOptions}
    />
  );
};
