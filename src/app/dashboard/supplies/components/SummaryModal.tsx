import React from "react";
import { Modal, Divider, Typography } from "antd";
import { Supply } from "../types";

const { Text } = Typography;

interface SummaryModalProps {
  visible: boolean;
  onCancel: () => void;
  supplies: Supply[];
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  visible,
  onCancel,
  supplies,
}) => (
  <Modal
    title="Payment Summary"
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={800}
  >
    <div className="space-y-6">
      <div>
        <Text strong className="text-lg block mb-4">
          Payment Type Summary
        </Text>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(
            supplies.reduce((acc: { [key: string]: number }, supply) => {
              acc[supply.paymentType] =
                (acc[supply.paymentType] || 0) + Number(supply.totalAmount);
              return acc;
            }, {})
          ).map(([type, amount]) => (
            <div key={type} className="border rounded p-4">
              <Text className="block mb-2">{type}</Text>
              <Text strong className="text-lg">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(amount)}
              </Text>
            </div>
          ))}
        </div>
      </div>
      <Divider />
      <div>
        <Text strong className="text-lg block mb-4">
          Supplier Summary
        </Text>
        {Object.entries(
          supplies.reduce(
            (
              acc: {
                [key: string]: {
                  total: number;
                  children: { [key: string]: number };
                };
              },
              supply
            ) => {
              const supplier = supply.supplier;
              const parentName =
                supplier.parent?.name || "Independent Suppliers";
              if (!acc[parentName]) {
                acc[parentName] = { total: 0, children: {} };
              }
              acc[parentName].total += Number(supply.totalAmount);
              acc[parentName].children[supplier.name] =
                (acc[parentName].children[supplier.name] || 0) +
                Number(supply.totalAmount);
              return acc;
            },
            {}
          )
        ).map(([parent, data]) => (
          <div key={parent} className="border-b pb-2 last:border-b-0">
            <div className="flex justify-between items-center mb-2">
              <Text strong>{parent}</Text>
              <Text strong>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(data.total)}
              </Text>
            </div>
            {Object.entries(data.children).map(([supplier, amount]) => (
              <div
                key={supplier}
                className="flex justify-between items-center pl-4 text-sm"
              >
                <Text>{supplier}</Text>
                <Text>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(amount)}
                </Text>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </Modal>
);
