"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal,
  Form,
  Select,
  Input,
  Table,
  Space,
  Popconfirm,
  App,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { ServiceType } from "@prisma/client";

interface ServiceExtraInfo {
  id: string;
  serviceType: ServiceType;
  serviceNames: string[];
  extraInfo: string;
  createdAt: string;
  updatedAt: string;
}

export default function ServiceExtraInfoPage() {
  const { message } = App.useApp();
  const [serviceExtraInfos, setServiceExtraInfos] = useState<
    ServiceExtraInfo[]
  >([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingServiceExtraInfo, setEditingServiceExtraInfo] =
    useState<ServiceExtraInfo | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  const fetchServiceExtraInfos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/service-extra-info");
      const data = await response.json();
      setServiceExtraInfos(data);
    } catch {
      message.error("Failed to fetch service extra info");
    } finally {
      setLoading(false);
    }
  }, [message, setLoading, setServiceExtraInfos]);

  useEffect(() => {
    fetchServiceExtraInfos();
  }, [fetchServiceExtraInfos]);

  const handleAdd = () => {
    setEditingServiceExtraInfo(null);
    form.resetFields();
    form.setFieldsValue({
      serviceType: "SERVICE",
      serviceNames: [],
      extraInfo: "",
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: ServiceExtraInfo) => {
    setEditingServiceExtraInfo(record);
    form.setFieldsValue({
      ...record,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/service-extra-info/${id}`, {
        method: "DELETE",
      });
      message.success("Service extra info deleted successfully");
      fetchServiceExtraInfos();
    } catch {
      message.error("Failed to delete service extra info");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const data = {
        ...values,
        serviceNames: values.serviceNames
          .split(",")
          .map((name: string) => name.trim()),
      };

      if (editingServiceExtraInfo) {
        await fetch(`/api/service-extra-info/${editingServiceExtraInfo.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        message.success("Service extra info updated successfully");
      } else {
        await fetch("/api/service-extra-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        message.success("Service extra info added successfully");
      }

      setIsModalVisible(false);
      fetchServiceExtraInfos();
    } catch {
      message.error("Failed to submit service extra info");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Service Type",
      dataIndex: "serviceType",
      key: "serviceType",
    },
    {
      title: "Service Names",
      dataIndex: "serviceNames",
      key: "serviceNames",
      render: (names: string[]) => names.join(", "),
    },
    {
      title: "Extra Info",
      dataIndex: "extraInfo",
      key: "extraInfo",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: string, record: ServiceExtraInfo) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this service extra info?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Service Extra Information</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Service Extra Info
        </Button>
      </div>

      <Table
        dataSource={serviceExtraInfos}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={
          editingServiceExtraInfo
            ? "Edit Service Extra Info"
            : "Add Service Extra Info"
        }
        open={isModalVisible}
        onOk={handleSubmit}
        confirmLoading={loading}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="serviceType"
            label="Service Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="SERVICE">Service</Select.Option>
              <Select.Option value="PARTS">Parts</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="serviceNames"
            label="Service Names (comma-separated)"
            rules={[{ required: true }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter service names separated by commas"
            />
          </Form.Item>

          <Form.Item
            name="extraInfo"
            label="Extra Information"
            rules={[{ required: true }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter extra information to display on invoice"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
