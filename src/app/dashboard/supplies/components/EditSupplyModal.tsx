import React from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Space,
  FormInstance,
} from "antd";
import { Supplier, Supply } from "../types";

interface EditSupplyModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Supply) => void;
  suppliers: Supplier[];
  loading: boolean;
  editForm: FormInstance<Supply>;
  handleEditValuesChange: (
    changedValues: Partial<Supply>,
    allValues: Supply
  ) => void;
  editingSupply: Supply | null;
}

export const EditSupplyModal: React.FC<EditSupplyModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  suppliers,
  loading,
  editForm,
  handleEditValuesChange,
  editingSupply,
}) => (
  <Modal
    title="Edit Supply"
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={1000}
  >
    <Form<Supply>
      form={editForm}
      layout="vertical"
      onFinish={onSubmit}
      onValuesChange={handleEditValuesChange}
      initialValues={editingSupply ?? undefined}
    >
      <div className="grid grid-cols-12 gap-4">
        <Form.Item
          name="suppliedDate"
          label="Date"
          rules={[{ required: true, message: "Please select a date" }]}
          className="col-span-2"
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="invoiceNumber"
          label="Invoice Number"
          rules={[{ required: true, message: "Please enter invoice number" }]}
          className="col-span-4"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="supplierId"
          label="Supplier"
          rules={[{ required: true, message: "Please select a supplier" }]}
          className="col-span-4"
        >
          <Select
            options={suppliers.map((s) => ({ label: s.name, value: s.id }))}
          />
        </Form.Item>
        <Form.Item
          name="paymentType"
          label="Payment"
          rules={[{ required: true, message: "Please select payment type" }]}
          className="col-span-2"
        >
          <Select>
            <Select.Option value="CASH">Cash</Select.Option>
            <Select.Option value="CARD">Card</Select.Option>
          </Select>
        </Form.Item>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter item name" }]}
          className="col-span-6"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[{ required: true, message: "Please enter quantity" }]}
          className="col-span-1"
        >
          <InputNumber step={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, message: "Please enter price" }]}
          className="col-span-2"
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: "100%" }}
            formatter={(value) =>
              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value: string | undefined) =>
              value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0
            }
          />
        </Form.Item>
        <Form.Item name="gstAmount" label="GST" className="col-span-1">
          <InputNumber style={{ width: "100%" }} prefix="$" />
        </Form.Item>
        <Form.Item name="totalAmount" label="Total" className="col-span-2">
          <InputNumber style={{ width: "100%" }} prefix="$" />
        </Form.Item>
      </div>
      <Form.Item name="description" label="Description">
        <Input />
      </Form.Item>
      <Form.Item name="remarks" label="Remarks">
        <Input.TextArea />
      </Form.Item>
      <Form.Item className="flex justify-end">
        <Space>
          <Button danger onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
);
