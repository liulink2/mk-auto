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
  Typography,
  Divider,
  App,
  FormInstance,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Expense {
  id: string;
  name: string;
  issuedDate: string;
  amount: number;
  paymentType: "CASH" | "CARD";
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseFormValues {
  name: string;
  issuedDate: Dayjs;
  amount: number;
  paymentType: "CASH" | "CARD";
  description?: string;
}

interface ExpenseFormProps {
  form: FormInstance<ExpenseFormValues>;
  onFinish: (values: ExpenseFormValues) => void;
  onCancel: () => void;
  initialValues?: Partial<ExpenseFormValues>;
  submitText?: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  form,
  onFinish,
  onCancel,
  initialValues,
  submitText = "Create",
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <div className="grid grid-cols-12 gap-4">
        <Form.Item
          name="issuedDate"
          label="Date"
          rules={[{ required: true, message: "Please select a date" }]}
          className="col-span-4"
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter expense name" }]}
          className="col-span-8"
        >
          <Input />
        </Form.Item>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: "Please enter amount" }]}
          className="col-span-6"
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: "100%" }}
            prefix="$"
          />
        </Form.Item>

        <Form.Item
          name="paymentType"
          label="Payment"
          rules={[{ required: true, message: "Please select payment type" }]}
          className="col-span-6"
        >
          <Select>
            <Select.Option value="CASH">Cash</Select.Option>
            <Select.Option value="CARD">Card</Select.Option>
          </Select>
        </Form.Item>
      </div>

      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {submitText}
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default function ExpenseManagementPage() {
  const { message } = App.useApp();
  const [date, setDate] = useState(dayjs());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchExpenses = useCallback(
    async (selectedDate: Dayjs) => {
      try {
        setLoading(true);
        const month = selectedDate.month() + 1; // dayjs months are 0-based
        const year = selectedDate.year();

        const response = await fetch(
          `/api/expenses?month=${month}&year=${year}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        message.error("Failed to fetch expenses");
      } finally {
        setLoading(false);
      }
    },
    [message]
  );

  useEffect(() => {
    fetchExpenses(date);
  }, [date, fetchExpenses]);

  const showAddModal = () => {
    addForm.setFieldsValue({
      issuedDate: dayjs(),
      name: "",
      amount: 0,
      paymentType: "CASH",
      description: "",
    });
    setIsAddModalVisible(true);
  };

  const showEditExpenseModal = (expense: Expense) => {
    setEditingExpense(expense);
    editForm.setFieldsValue({
      ...expense,
      issuedDate: dayjs(expense.issuedDate),
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
    setEditingExpense(null);
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create expense");
      }

      message.success("Expense created successfully");
      setIsAddModalVisible(false);
      addForm.resetFields();
      fetchExpenses(date);
    } catch {
      message.error("Failed to create expense");
    }
  };

  const handleEditSubmit = async (values: ExpenseFormValues) => {
    if (!editingExpense) return;
    try {
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          issuedDate: values.issuedDate.toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Failed to update expense");
      message.success("Expense updated successfully");
      setIsEditModalVisible(false);
      fetchExpenses(date);
    } catch {
      message.error("Failed to update expense");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete expense");

      message.success("Expense deleted successfully");
      fetchExpenses(date);
    } catch {
      message.error("Failed to delete expense");
    }
  };

  const columns: ColumnsType<Expense> = [
    {
      title: "Date",
      dataIndex: "issuedDate",
      key: "issuedDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      width: 100,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 300,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
      },
      width: 150,
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
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 300,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditExpenseModal(record)}
            title="Edit Expense"
          />
          <Popconfirm
            title="Delete expense"
            description="Are you sure you want to delete this expense?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Delete Expense"
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
        <h1 className="text-2xl font-bold">Expense Management</h1>
        <Space>
          <DatePicker.MonthPicker
            value={date}
            onChange={(newDate) => newDate && setDate(newDate)}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add Expense
          </Button>
        </Space>
      </div>

      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text type="secondary">Total Expenses</Text>
            <div
              className="text-2xl font-bold cursor-pointer text-blue-500"
              onClick={() => setIsSummaryModalVisible(true)}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(
                expenses.reduce((sum, expense) => sum + expense.amount, 0)
              )}
            </div>
          </div>
        </div>
      </Card>

      <Divider />

      <Table
        columns={columns}
        dataSource={expenses}
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title="New Expense"
        open={isAddModalVisible}
        onCancel={handleAddCancel}
        footer={null}
        width={800}
      >
        <ExpenseForm
          form={addForm}
          onFinish={handleSubmit}
          onCancel={handleAddCancel}
          initialValues={{ paymentType: "CASH" }}
        />
      </Modal>

      <Modal
        title="Edit Expense"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={800}
      >
        <ExpenseForm
          form={editForm}
          onFinish={handleEditSubmit}
          onCancel={handleEditCancel}
          submitText="Update"
        />
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
                expenses.reduce((acc: { [key: string]: number }, expense) => {
                  acc[expense.paymentType] =
                    (acc[expense.paymentType] || 0) + expense.amount;
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
        </div>
      </Modal>
    </div>
  );
}
