import React from "react";
import { Modal, Table, Typography } from "antd";
import { Supply } from "../types";

const { Text } = Typography;

interface InvoiceDetailsModalProps {
  visible: boolean;
  onCancel: () => void;
  selectedInvoiceItems: Supply[];
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  visible,
  onCancel,
  selectedInvoiceItems,
}) => (
  <Modal
    title="Invoice Details"
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={1000}
  >
    <Table
      columns={[
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "description",
        },
        {
          title: "Quantity",
          dataIndex: "quantity",
          key: "quantity",
        },
        {
          title: "Price",
          dataIndex: "price",
          key: "price",
          render: (price: number) => {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(price);
          },
        },
        {
          title: "GST",
          dataIndex: "gstAmount",
          key: "gstAmount",
          render: (amount: number) => {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(amount);
          },
        },
        {
          title: "Total",
          dataIndex: "totalAmount",
          key: "totalAmount",
          render: (amount: number) => {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(amount);
          },
        },
      ]}
      dataSource={selectedInvoiceItems}
      rowKey="id"
      pagination={false}
    />
    <div className="mt-4 text-right">
      <Text strong>Total Amount: </Text>
      <Text strong className="text-lg">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(
          selectedInvoiceItems.reduce(
            (sum, item) => sum + Number(item.totalAmount),
            0
          )
        )}
      </Text>
    </div>
  </Modal>
);
