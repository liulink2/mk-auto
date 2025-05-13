"use client";

import { useState, useEffect } from "react";
import {
  Card,
  DatePicker,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  message,
  Divider,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

interface SupplyItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

interface Supplier {
  id: string;
  name: string;
}

interface Supply {
  id: string;
  supplierId: string;
  supplier: Supplier;
  invoiceNumber: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  paymentType: "CASH" | "CARD";
  remarks?: string;
  suppliedDate: string;
  createdAt: string;
  updatedAt: string;
  items?: SupplyItem[];
}

interface SupplyFormValues {
  invoiceNumber: string;
  supplierId: string;
  suppliedDate: Dayjs;
  paymentType: "CASH" | "CARD";
  remarks?: string;
  items: SupplyItem[];
}

export default function SupplyManagementPage() {
  const [date, setDate] = useState(dayjs());
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [editingItem, setEditingItem] = useState<SupplyItem | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchSupplies();
    fetchSuppliers();
  }, [date]);

  const fetchSupplies = async () => {
    try {
      setLoading(true);
      const startDate = date.startOf("month").toISOString();
      const endDate = date.endOf("month").toISOString();

      const response = await fetch(
        `/api/supplies?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch supplies");
      }
      const data = await response.json();
      setSupplies(data);
    } catch (error) {
      console.error("Failed to fetch supplies:", error);
      message.error("Failed to fetch supplies");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      message.error("Failed to fetch suppliers");
    }
  };

  const showAddModal = () => {
    addForm.setFieldsValue({
      suppliedDate: dayjs(),
      invoiceNumber: "",
      supplierId: undefined,
      paymentType: "CASH",
      remarks: "",
      items: [{ name: "", description: "", quantity: 1, price: 0 }],
    });
    setIsAddModalVisible(true);
  };

  const showEditSupplyModal = (supply: Supply) => {
    setEditingSupply(supply);
    editForm.setFieldsValue({
      ...supply,
      suppliedDate: dayjs(supply.suppliedDate),
    });
    setIsEditModalVisible(true);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    addForm.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    setEditingSupply(null);
    setEditingItem(null);
  };

  const handleSubmit = async (values: SupplyFormValues) => {
    try {
      const items = values.items.map((item: SupplyItem) => ({
        invoiceNumber: values.invoiceNumber,
        supplierId: values.supplierId,
        suppliedDate: values.suppliedDate.toISOString(),
        paymentType: values.paymentType,
        remarks: values.remarks,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      }));

      const response = await fetch("/api/supplies/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(items),
      });

      if (!response.ok) {
        throw new Error("Failed to create supplies");
      }

      message.success("Supplies created successfully");
      setIsAddModalVisible(false);
      addForm.resetFields();
      fetchSupplies();
    } catch (error) {
      console.error("Error creating supplies:", error);
      message.error("Failed to create supplies");
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingSupply) return;
    try {
      const response = await fetch(`/api/supplies/${editingSupply.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          suppliedDate: values.suppliedDate.toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Failed to update supply");
      message.success("Supply updated successfully");
      setIsEditModalVisible(false);
      fetchSupplies();
    } catch (error) {
      message.error("Failed to update supply");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/supplies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete supply");

      message.success("Supply deleted successfully");
      fetchSupplies();
    } catch (error) {
      message.error("Failed to delete supply");
    }
  };

  const columns: ColumnsType<Supply> = [
    {
      title: "Date",
      dataIndex: "suppliedDate",
      key: "suppliedDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: "Supplier",
      dataIndex: ["supplier", "name"],
      key: "supplier",
    },
    {
      title: "Items",
      key: "items",
      render: (_, record) => (
        <ul className="list-disc pl-4">
          {record.items?.map((item: any, index: number) => (
            <li key={index} className="flex items-center gap-2">
              <span>
                {item.name} - {item.quantity} x ${item.price}
              </span>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => showEditSupplyModal(record)}
                title="Edit Supply"
              />
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Total",
      key: "total",
      render: (_, record) => {
        const total =
          record.items?.reduce(
            (sum: number, item: any) => sum + item.quantity * item.price,
            0
          ) ?? 0;
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(total);
      },
    },
    {
      title: "Payment Type",
      dataIndex: "paymentType",
      key: "paymentType",
      render: (type: string) => (
        <Tag color={type === "CASH" ? "green" : "blue"}>{type}</Tag>
      ),
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
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Supply Management</h1>
        <Space>
          <DatePicker.MonthPicker
            value={date}
            onChange={(newDate) => newDate && setDate(newDate)}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add Supply
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={supplies}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      />

      <Modal
        title="New Supply Invoice"
        open={isAddModalVisible}
        onCancel={handleAddCancel}
        footer={null}
        width={1000}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            paymentType: "CASH",
            items: [{ name: "", description: "", quantity: 1, price: 0 }],
          }}
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
              rules={[
                { required: true, message: "Please enter invoice number" },
              ]}
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
                options={suppliers.map((s) => ({
                  label: s.name,
                  value: s.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="paymentType"
              label="Payment"
              rules={[
                { required: true, message: "Please select payment type" },
              ]}
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
                  <div key={key} className="flex items-center gap-3 mb-2">
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      label="Name"
                      rules={[
                        { required: true, message: "Please enter item name" },
                      ]}
                      className="flex-1 mb-0"
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      label="Quantity"
                      rules={[
                        { required: true, message: "Please input quantity!" },
                      ]}
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
                      rules={[
                        { required: true, message: "Please input price!" },
                      ]}
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
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        className="mt-3"
                      />
                    )}
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

          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={handleAddCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Supply"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={1000}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
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
              rules={[
                { required: true, message: "Please enter invoice number" },
              ]}
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
              rules={[
                { required: true, message: "Please select payment type" },
              ]}
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
              className="col-span-8"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: "Please enter quantity" }]}
              className="col-span-2"
            >
              <InputNumber min={1} style={{ width: "100%" }} />
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
          </div>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
              <Button onClick={handleEditCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
