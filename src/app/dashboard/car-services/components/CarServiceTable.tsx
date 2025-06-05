import { Table } from "antd";
import React from "react";
import { CarService } from "../types";
import { ColumnsType } from "antd/es/table";

interface CarServiceTableProps {
  dataSource: CarService[];
  columns: ColumnsType<CarService>;
  rowKey: string;
  loading: boolean;
}

const CarServiceTable: React.FC<CarServiceTableProps> = ({
  dataSource,
  columns,
  rowKey,
  loading,
}) => {
  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={rowKey}
      pagination={false}
      loading={loading}
    />
  );
};

export default CarServiceTable;
