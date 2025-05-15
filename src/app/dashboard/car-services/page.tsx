"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Space,
  Card,
  Select,
  message,
  Tag,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface CarServiceItem {
  id: string;
  serviceType: string;
  name: string;
  price: number;
  quantity: number;
  totalAmount: number;
}

interface CarService {
  id: string;
  carPlate: string;
  carDetails: string;
  ownerName: string;
  phoneNo: string;
  carInDateTime: string;
  carOutDateTime?: string;
  totalAmount: number;
  paidInCash: number;
  paidInCard: number;
  year: number;
  month: number;
  carServiceItems: CarServiceItem[];
}

export default function CarServicesPage() {
  const [carServices, setCarServices] = useState<CarService[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCarService, setEditingCarService] = useState<CarService | null>(
    null
  );
  const [form] = Form.useForm();
  const [selectedMonthYear, setSelectedMonthYear] = useState(dayjs());

  const fetchCarServices = async () => {
    try {
      const month = selectedMonthYear.month() + 1;
      const year = selectedMonthYear.year();
      const response = await fetch(
        `/api/car-services?month=${month}&year=${year}`
      );
      const data = await response.json();
      setCarServices(data);
    } catch (error) {
      console.error("Error fetching car services:", error);
      message.error("Failed to fetch car services");
    }
  };

  useEffect(() => {
    fetchCarServices();
  }, [selectedMonthYear]);

  const handleAdd = () => {
    setEditingCarService(null);
    form.resetFields();
    form.setFieldsValue({
      carInDateTime: dayjs(),
      totalAmount: 0,
      paidInCash: 0,
      paidInCard: 0,
      carServiceItems: [
        {
          serviceType: "SERVICE",
          name: "",
          price: 0,
          quantity: 1,
          totalAmount: 0,
        },
      ],
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: CarService) => {
    setEditingCarService(record);
    form.setFieldsValue({
      ...record,
      carInDateTime: dayjs(record.carInDateTime),
      carOutDateTime: record.carOutDateTime
        ? dayjs(record.carOutDateTime)
        : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/car-services/${id}`, {
        method: "DELETE",
      });
      message.success("Car service deleted successfully");
      fetchCarServices();
    } catch (error) {
      console.error("Error deleting car service:", error);
      message.error("Failed to delete car service");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const carInDateTime = values.carInDateTime.toISOString();
      const carOutDateTime = values.carOutDateTime?.toISOString();

      const data = {
        ...values,
        carInDateTime,
        carOutDateTime,
      };

      if (editingCarService) {
        await fetch(`/api/car-services/${editingCarService.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        message.success("Car service updated successfully");
      } else {
        await fetch("/api/car-services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        message.success("Car service added successfully");
      }

      setIsModalVisible(false);
      fetchCarServices();
    } catch (error) {
      console.error("Error submitting car service:", error);
      message.error("Failed to submit car service");
    }
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (!allValues.carServiceItems) return;

    let totalAmount = 0;
    allValues.carServiceItems.forEach((item: any) => {
      item.totalAmount = item.price ?? 0 * item.quantity ?? 0;
      totalAmount += item.totalAmount;
    });
    form.setFieldsValue({ ...allValues, totalAmount });
  };

  const columns = [
    {
      title: "Status",
      key: "status",
      render: (_: any, record: CarService) => {
        return (
          <>
            {!record.carOutDateTime ? (
              <Tag color="green">Active</Tag>
            ) : (
              <Tag color="blue">Completed</Tag>
            )}
            {record.totalAmount - record.paidInCash - record.paidInCard !==
              0 && <Tag color="red">Payment</Tag>}
          </>
        );
      },
    },
    {
      title: "Car Plate",
      dataIndex: "carPlate",
      key: "carPlate",
      render: (text: string) => <Tag color="default">{text.toUpperCase()}</Tag>,
    },
    {
      title: "Car Details",
      dataIndex: "carDetails",
      key: "carDetails",
    },
    {
      title: "Owner Name",
      dataIndex: "ownerName",
      key: "ownerName",
    },
    {
      title: "Phone No",
      dataIndex: "phoneNo",
      key: "phoneNo",
    },
    {
      title: "Car In Date",
      dataIndex: "carInDateTime",
      key: "carInDateTime",
      render: (text: string) => dayjs(text).format("DD-MM-YYYY HH:mm"),
    },
    {
      title: "Car Out Date",
      dataIndex: "carOutDateTime",
      key: "carOutDateTime",
      render: (text: string) =>
        text ? dayjs(text).format("DD-MM-YYYY HH:mm") : "-",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (text: number) => `$${text.toFixed(2)}`,
    },
    {
      title: "Paid in Cash",
      dataIndex: "paidInCash",
      key: "paidInCash",
      render: (text: number) => `$${text.toFixed(2)}`,
    },
    {
      title: "Paid in Card",
      dataIndex: "paidInCard",
      key: "paidInCard",
      render: (text: number) => `$${text.toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: CarService) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this car service?"
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

  const summary = useMemo(() => {
    const totalServices = carServices.length;
    const totalAmount = carServices.reduce(
      (sum, service) => sum + service.totalAmount,
      0
    );
    const totalCash = carServices.reduce(
      (sum, service) => sum + service.paidInCash,
      0
    );
    const totalCard = carServices.reduce(
      (sum, service) => sum + service.paidInCard,
      0
    );

    return {
      totalServices,
      totalAmount,
      totalCash,
      totalCard,
    };
  }, [carServices]);

  const activeCarServices = carServices.filter(
    (service) => !service.carOutDateTime
  );
  const completedCarServices = carServices.filter(
    (service) => service.carOutDateTime
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Car Services</h1>
        <Space>
          <DatePicker.MonthPicker
            value={selectedMonthYear}
            onChange={(date) => setSelectedMonthYear(date || dayjs())}
            format="MMMM YYYY"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Car Service
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card title="Total Services">{summary.totalServices}</Card>
        <Card title="Total Amount">${summary.totalAmount.toFixed(2)}</Card>
        <Card title="Paid in Cash">${summary.totalCash.toFixed(2)}</Card>
        <Card title="Paid in Card">${summary.totalCard.toFixed(2)}</Card>
      </div>

      <h2 className="text-xl font-bold mt-4">Active Car Service</h2>
      <Table
        dataSource={activeCarServices}
        columns={columns}
        rowKey="id"
        pagination={false}
      />

      <h2 className="text-xl font-bold mt-4">Completed Car Service</h2>
      <Table
        dataSource={completedCarServices}
        columns={columns}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={editingCarService ? "Edit Car Service" : "Add Car Service"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={1200}
      >
        <Form
          form={form}
          onValuesChange={handleValuesChange}
          layout="vertical"
          className="mt-4"
        >
          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="carPlate"
              label="Car Plate"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="ownerName"
              label="Owner Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phoneNo"
              label="Phone No"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="carInDateTime"
              label="Car In Date Time"
              rules={[{ required: true }]}
            >
              <DatePicker showTime format="DD-MM-YYYY HH:mm" />
            </Form.Item>

            <Form.Item name="carOutDateTime" label="Car Out Date Time">
              <DatePicker showTime format="DD-MM-YYYY HH:mm" />
            </Form.Item>

            <Form.Item
              name="carDetails"
              label="Car Details"
              className="col-span-3"
            >
              <Input />
            </Form.Item>
          </div>

          <div className="mt-4 mb-4">
            <h2 className="text-lg font-bold">Service Items</h2>
            <Form.List name="carServiceItems">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="grid grid-cols-12 gap-4">
                      <Form.Item
                        {...restField}
                        name={[name, "serviceType"]}
                        rules={[
                          { required: true, message: "Missing service type" },
                        ]}
                        className="col-span-2"
                      >
                        <Select placeholder="Select type">
                          <Select.Option value="SERVICE">Service</Select.Option>
                          <Select.Option value="PARTS">Parts</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        rules={[{ required: true, message: "Missing name" }]}
                        className="col-span-6"
                      >
                        <Input placeholder="Name" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "price"]}
                        rules={[{ required: true, message: "Missing price" }]}
                        className="col-span-1"
                      >
                        <InputNumber placeholder="Price" prefix="$" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[
                          { required: true, message: "Missing quantity" },
                        ]}
                        className="col-span-1"
                      >
                        <InputNumber placeholder="Quantity" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "totalAmount"]}
                        rules={[
                          { required: true, message: "Missing total amount" },
                        ]}
                        className="col-span-1"
                      >
                        <InputNumber placeholder="Total" prefix="$" disabled />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        className="col-span-1"
                      />
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Service Item
                  </Button>
                </>
              )}
            </Form.List>
          </div>
          <div className="flex justify-end">
            <Form.Item
              name="totalAmount"
              label="Total Amount"
              rules={[{ required: true }]}
            >
              <InputNumber
                size="large"
                style={{ width: "100%" }}
                prefix="$"
                disabled
              />
            </Form.Item>
          </div>
          <div className="flex gap-4 justify-end items-center">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                form.setFieldsValue({
                  paidInCash: form.getFieldValue("totalAmount"),
                });
              }}
            />
            <Form.Item
              name="paidInCash"
              label="Paid in Cash"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} prefix="$" />
            </Form.Item>
          </div>
          <div className="flex gap-4 justify-end items-center">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                form.setFieldsValue({
                  paidInCard: form.getFieldValue("totalAmount"),
                });
              }}
            />
            <Form.Item
              name="paidInCard"
              label="Paid in Card"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} prefix="$" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
