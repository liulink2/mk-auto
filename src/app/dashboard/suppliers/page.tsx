"use client";

import {
  Button,
  Space,
  Popconfirm,
  Input,
  Modal,
  Form,
  Table,
  Select,
  App,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  PlusOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
} from "@ant-design/icons";

interface Supplier {
  id: string;
  name: string;
  isActive: boolean;
  parentId: string | null;
  children?: Supplier[];
}

export default function SuppliersPage() {
  const { message } = App.useApp();
  const { data: session } = useSession();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuppliers();
  }, [session, router]);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/suppliers");

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      message.error(
        error instanceof Error ? error.message : "Failed to fetch suppliers"
      );
    } finally {
      setLoading(false);
    }
  }, [message]);

  const handleToggleStatus = async (
    supplierId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/suppliers/${supplierId}/toggle-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update supplier status");

      message.success(
        `Supplier ${currentStatus ? "disabled" : "enabled"} successfully`
      );
      fetchSuppliers();
    } catch {
      message.error("Failed to update supplier status");
    }
  };

  const handleDelete = async (supplierId: string) => {
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      message.success("Supplier deleted successfully");
      fetchSuppliers();
    } catch {
      message.error("Failed to delete supplier");
    }
  };

  const showModal = (supplier?: Supplier) => {
    setEditingSupplier(supplier || null);
    form.setFieldsValue(supplier || { name: "", parentId: null });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingSupplier(null);
  };

  const handleSubmit = async (values: {
    name: string;
    parentId: string | null;
  }) => {
    try {
      const url = editingSupplier
        ? `/api/suppliers/${editingSupplier.id}`
        : "/api/suppliers";

      const response = await fetch(url, {
        method: editingSupplier ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to save supplier");

      message.success(
        `Supplier ${editingSupplier ? "updated" : "created"} successfully`
      );
      handleCancel();
      fetchSuppliers();
    } catch {
      message.error("Failed to save supplier");
    }
  };

  const getParentOptions = () => {
    // Only show suppliers that don't have a parent (top-level suppliers)
    return suppliers
      .filter((supplier) => !supplier.parentId)
      .map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
      }));
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <span className={isActive ? "text-green-600" : "text-red-600"}>
          {isActive ? "Active" : "Disabled"}
        </span>
      ),
    },
    {
      title: "Parent Supplier",
      key: "parent",
      render: (record: Supplier) => {
        const parent = suppliers.find((s) => s.id === record.parentId);
        return parent ? parent.name : "-";
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Supplier) => (
        <Space>
          <Button
            type="text"
            icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleStatus(record.id, record.isActive)}
            title={record.isActive ? "Disable Supplier" : "Enable Supplier"}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            title="Edit Supplier"
          />
          <Popconfirm
            title="Delete supplier"
            description="Are you sure you want to delete this supplier?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Delete Supplier"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Supplier Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add Supplier
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={suppliers}
        rowKey="id"
        loading={loading}
        expandable={{
          rowExpandable: () => false,
          expandedRowRender: () => null,
        }}
      />

      <Modal
        title={editingSupplier ? "Edit Supplier" : "Add Supplier"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input supplier name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="Parent Supplier"
            help={
              editingSupplier?.parentId
                ? "This supplier is a child supplier and cannot have its own children."
                : "Optional. Select a parent supplier if this is a sub-supplier. Child suppliers cannot have their own children."
            }
          >
            <Select
              allowClear
              placeholder="Select parent supplier"
              options={getParentOptions()}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingSupplier ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
