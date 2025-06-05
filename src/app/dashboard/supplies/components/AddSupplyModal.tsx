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
  Divider,
  Upload,
  Typography,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Supplier, SupplyFormValues } from "../types";
import dayjs from "dayjs";

const { Text } = Typography;

interface AddSupplyModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: SupplyFormValues) => void;
  suppliers: Supplier[];
  loading: boolean;
  uploading: boolean;
  handleUpload: (file: File) => Promise<boolean | void>;
  addForm: any;
  handleValuesChange: (
    _: Partial<SupplyFormValues>,
    allValues: SupplyFormValues
  ) => void;
}

export const AddSupplyModal: React.FC<AddSupplyModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  suppliers,
  loading,
  uploading,
  handleUpload,
  addForm,
  handleValuesChange,
}) => (
  <Modal
    title="New Supply Invoice"
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={1200}
  >
    <Form<SupplyFormValues>
      form={addForm}
      layout="vertical"
      onFinish={onSubmit}
      onValuesChange={handleValuesChange}
      initialValues={{
        paymentType: "CASH",
        items: [{ name: "", description: "", quantity: 1, price: 0 }],
      }}
    >
      <div className="mb-4">
        <Upload
          accept="image/*"
          beforeUpload={handleUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            [AI] Upload Invoice for auto filling
          </Button>{" "}
        </Upload>
      </div>
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
            options={suppliers
              .filter((supplier) => supplier.children.length === 0)
              .map((s) => ({
                label: `${s.name} ${s.parent ? `(${s.parent.name})` : ""}`,
                value: s.id,
              }))}
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
      <Divider>Items</Divider>
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div key={key} className="flex">
                <div className="grid grid-cols-12 gap-4 mb-1">
                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    label="Name"
                    rules={[
                      { required: true, message: "Please enter item name" },
                    ]}
                    className="col-span-7"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    label="Qty"
                    rules={[
                      { required: true, message: "Please input quantity!" },
                    ]}
                    className="col-span-1"
                  >
                    <InputNumber
                      min={1}
                      style={{ width: "100%" }}
                      parser={(value: string | undefined) =>
                        value ? parseInt(value) : 0
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "price"]}
                    label="Price"
                    rules={[{ required: true, message: "Please input price!" }]}
                    className="col-span-1"
                  >
                    <InputNumber style={{ width: "100%" }} prefix="$" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "gstAmount"]}
                    label="GST"
                    className="col-span-1"
                  >
                    <InputNumber style={{ width: "100%" }} prefix="$" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "totalAmount"]}
                    label="Total"
                    className="col-span-2"
                  >
                    <InputNumber style={{ width: "100%" }} prefix="$" />
                  </Form.Item>
                </div>
                <div>
                  {fields.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                      className="mt-8 col-span-1"
                    />
                  )}
                </div>
              </div>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add({ name: "", quantity: 1, price: 0 })}
                block
                icon={<PlusOutlined />}
              >
                Add Item
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <div className="flex justify-end mb-4">
        <div className="text-right text-xl">
          GST Amount:
          <div className="text-xl font-bold">
            <Form.Item name="totalGstAmount" className="text-xl font-bold">
              <InputNumber style={{ width: "100%" }} prefix="$" size="large" />
            </Form.Item>
          </div>
        </div>
        <div className="text-right text-xl ml-4">
          Total Amount:
          <div className="text-xl font-bold">
            <Form.Item name="totalAmount" className="text-xl font-bold">
              <InputNumber style={{ width: "100%" }} prefix="$" size="large" />
            </Form.Item>
          </div>
        </div>
      </div>
      <Form.Item className="flex justify-end">
        <Space>
          <Button danger onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
);
