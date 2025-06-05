import { Table, Button, Tag, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Supply } from "../types";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import React from "react";

interface SupplyTableProps {
  supplies: Supply[];
  loading: boolean;
  showEditSupplyModal: (supply: Supply) => void;
  handleDelete: (id: string) => void;
  showInvoiceDetails: (invoiceNumber: string) => void;
}

export const SupplyTable: React.FC<SupplyTableProps> = ({
  supplies,
  loading,
  showEditSupplyModal,
  handleDelete,
  showInvoiceDetails,
}) => {
  const columns: ColumnsType<Supply> = [
    {
      title: "Date",
      dataIndex: "suppliedDate",
      key: "suppliedDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      width: 100,
    },
    {
      title: "Supplier",
      dataIndex: ["supplier", "name"],
      key: "supplier",
      width: 200,
    },
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      width: 200,
      render: (invoiceNumber: string) => (
        <Button type="link" onClick={() => showInvoiceDetails(invoiceNumber)}>
          {invoiceNumber}
        </Button>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 700,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 50,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (_, record) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(record.price);
      },
      width: 100,
    },
    {
      title: "GST",
      dataIndex: "gstAmount",
      key: "gstAmount",
      render: (_, record) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(record.gstAmount);
      },
      width: 100,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (_, record) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(record.totalAmount);
      },
      width: 100,
    },
    {
      title: "Payment",
      dataIndex: "paymentType",
      key: "paymentType",
      render: (type: string) => (
        <Tag color={type === "CASH" ? "green" : "blue"}>{type}</Tag>
      ),
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditSupplyModal(record)}
            title="Edit Supply"
          />
          <Popconfirm
            title="Delete supply"
            description="Are you sure you want to delete this supply?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Delete Supply"
            />
          </Popconfirm>
        </Space>
      ),
      width: 100,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={supplies}
      loading={loading}
      rowKey="id"
      pagination={false}
    />
  );
};
