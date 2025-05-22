"use client";

import { useState, useEffect, useCallback } from "react";
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
  Divider,
  Typography,
  App,
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

const { Text } = Typography;

interface SupplyItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  amount: number;
}

interface Supplier {
  id: string;
  name: string;
  parent?: Supplier;
  children: Supplier[];
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
  const { message } = App.useApp();
  const [date, setDate] = useState(dayjs());
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchSupplies = useCallback(
    async (selectedDate: Dayjs) => {
      try {
        setLoading(true);
        const month = selectedDate.month() + 1; // dayjs months are 0-based
        const year = selectedDate.year();

        const response = await fetch(
          `/api/supplies?month=${month}&year=${year}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch supplies");
        }
        const data = await response.json();
        setSupplies(data);
      } catch {
        message.error("Failed to fetch supplies");
      } finally {
        setLoading(false);
      }
    },
    [message]
  );

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }
      const data = await response.json();
      setSuppliers(data);
    } catch {
      message.error("Failed to fetch suppliers");
    }
  }, [message]);

  useEffect(() => {
    fetchSupplies(date);
    fetchSuppliers();
  }, [date, fetchSuppliers, fetchSupplies]);

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
      fetchSupplies(date);
    } catch {
      message.error("Failed to create supplies");
    }
  };

  const handleValuesChange = (
    _: Partial<SupplyFormValues>,
    allValues: SupplyFormValues
  ) => {
    if (allValues.items) {
      let totalAmount = 0;
      allValues.items.forEach((item: SupplyItem) => {
        item.amount = item.quantity * item.price;
        totalAmount += item.amount;
      });
      addForm.setFieldsValue({
        totalAmount,
        items: allValues.items,
      });
    }
  };

  const handleEditSubmit = async (values: SupplyFormValues) => {
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
      fetchSupplies(date);
    } catch {
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
      fetchSupplies(date);
    } catch {
      message.error("Failed to delete supply");
    }
  };

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
    },
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      width: 200,
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
      title: "Total",
      key: "total",
      render: (_, record) => {
        const total = record.quantity * record.price;
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(total);
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

      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text type="secondary">Total Quantity</Text>
            <div className="text-2xl font-bold">
              {supplies.reduce((sum, supply) => sum + supply.quantity, 0)}
            </div>
          </div>
          <div>
            <Text type="secondary">Total Amount</Text>
            <div
              className="text-2xl font-bold cursor-pointer text-blue-500"
              onClick={() => setIsSummaryModalVisible(true)}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(
                supplies.reduce(
                  (sum, supply) => sum + supply.quantity * supply.price,
                  0
                )
              )}
            </div>
          </div>
        </div>
      </Card>

      <Divider />

      <Table
        columns={columns}
        dataSource={supplies}
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title="New Supply Invoice"
        open={isAddModalVisible}
        onCancel={handleAddCancel}
        footer={null}
        width={1200}
      >
        <Form<SupplyFormValues>
          form={addForm}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
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
                  <div key={key} className="flex">
                    <div className="grid grid-cols-12 gap-4 mb-1">
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        label="Name"
                        rules={[
                          { required: true, message: "Please enter item name" },
                        ]}
                        className="col-span-8"
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
                        rules={[
                          { required: true, message: "Please input price!" },
                        ]}
                        className="col-span-1"
                      >
                        <InputNumber style={{ width: "100%" }} prefix="$" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "amount"]}
                        label="Amount"
                        className="col-span-2"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          disabled
                          prefix="$"
                        />
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
              Total Amount:
              <div className="text-xl font-bold">
                <Form.Item name="totalAmount" className="text-xl font-bold">
                  <InputNumber
                    style={{ width: "100%" }}
                    disabled
                    prefix="$"
                    size="large"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <Form.Item className="flex justify-end">
            <Space>
              <Button danger onClick={handleAddCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
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
          <Form.Item className="flex justify-end">
            <Space>
              <Button danger onClick={handleEditCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Payment Summary"
        open={isSummaryModalVisible}
        onCancel={() => setIsSummaryModalVisible(false)}
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
                  const amount = supply.quantity * supply.price;
                  acc[supply.paymentType] =
                    (acc[supply.paymentType] || 0) + amount;
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
                  const amount = supply.quantity * supply.price;

                  if (!acc[parentName]) {
                    acc[parentName] = { total: 0, children: {} };
                  }

                  acc[parentName].total += amount;
                  acc[parentName].children[supplier.name] =
                    (acc[parentName].children[supplier.name] || 0) + amount;

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
                    <Text type="secondary">{supplier}</Text>
                    <Text type="secondary">
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
    </div>
  );
}
