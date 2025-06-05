import { Table } from "antd";
import React from "react";

interface CarServiceTableProps {
  dataSource: any[];
  columns: any[];
  rowKey: string;
  pagination?: boolean;
  loading: boolean;
}

const CarServiceTable: React.FC<CarServiceTableProps> = ({
  dataSource,
  columns,
  rowKey,
  pagination,
  loading,
}) => {
  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={rowKey}
      pagination={pagination ? undefined : false}
      loading={loading}
    />
  );
};

export default CarServiceTable;
