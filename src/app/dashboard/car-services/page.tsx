"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Tag,
  Popconfirm,
  AutoComplete,
  App,
  Popover,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  CheckOutlined,
  PhoneOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CarOutlined,
  CreditCardOutlined,
  DollarOutlined,
  LeftSquareTwoTone,
  RightSquareTwoTone,
  FileTextOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { debounce } from "lodash";
import { Supply } from "@prisma/client";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";

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
  gstAmount?: number;
  paidInCash?: number;
  paidInCard?: number;
  year: number;
  month: number;
  carServiceItems: CarServiceItem[];
  discountType?: "PERCENTAGE" | "FIXED";
  discountAmount?: number;
  finalAmount: number;
}

export default function CarServicesPage() {
  const { message } = App.useApp();
  const companySettings = useCompanySettings();
  const [carServices, setCarServices] = useState<CarService[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [selectedCarService, setSelectedCarService] =
    useState<CarService | null>(null);
  const [editingCarService, setEditingCarService] = useState<CarService | null>(
    null
  );
  const [form] = Form.useForm();
  const [selectedMonthYear, setSelectedMonthYear] = useState(dayjs());
  const [supplyNames, setSupplyNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCarServices = useCallback(
    async (selectedDate: Dayjs) => {
      try {
        const month = selectedDate.month() + 1;
        const year = selectedDate.year();
        setLoading(true);
        const response = await fetch(
          `/api/car-services?month=${month}&year=${year}`
        );
        const data = await response.json();
        setCarServices(data);
      } catch {
        message.error("Failed to fetch car services");
      } finally {
        setLoading(false);
      }
    },
    [setCarServices, message]
  );

  // Debounce the supply name fetching
  const debouncedFetchSupplyNames = debounce(async (searchText: string) => {
    if (!searchText || searchText.length < 3) return;
    try {
      const response = await fetch(`/api/supplies/names?search=${searchText}`);
      if (!response.ok) {
        throw new Error("Failed to fetch supply names");
      }
      const data = await response.json();
      setSupplyNames(data.map((supply: Supply) => supply.name));
    } catch (error) {
      console.error("Failed to fetch supply names:", error);
      message.error("Failed to fetch supply names");
    }
  }, 300);

  useEffect(() => {
    fetchCarServices(selectedMonthYear);
  }, [selectedMonthYear, fetchCarServices]);

  const handleAdd = () => {
    setEditingCarService(null);
    form.resetFields();
    form.setFieldsValue({
      carInDateTime: dayjs(),
      totalAmount: 0,
      gstAmount: 0,
      finalAmount: 0,
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
      fetchCarServices(selectedMonthYear);
    } catch {
      message.error("Failed to delete car service");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
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
      fetchCarServices(selectedMonthYear);
    } catch {
      message.error("Failed to submit car service");
    } finally {
      setLoading(false);
    }
  };

  const handleValuesChange = (_: Partial<CarService>, values: CarService) => {
    if (!values.carServiceItems) return;

    let totalAmount = 0;
    let finalAmount = 0;
    const carServiceItems = values.carServiceItems.map((item) => {
      const amount = (item.price ?? 0) * (item.quantity ?? 0);
      totalAmount += amount;
      return {
        ...item,
        totalAmount: amount,
      };
    });
    if (values.discountType && values.discountAmount) {
      if (values.discountType === "PERCENTAGE") {
        finalAmount =
          totalAmount - (totalAmount * (values.discountAmount ?? 0)) / 100;
      } else {
        finalAmount = totalAmount - (values.discountAmount ?? 0);
      }
    } else {
      finalAmount = totalAmount;
    }

    const gstAmount = Math.round(finalAmount * 0.1 * 100) / 100;

    form.setFieldsValue({
      ...values,
      carServiceItems,
      totalAmount,
      finalAmount,
      gstAmount,
    });
  };

  const handleViewInvoice = (record: CarService) => {
    setSelectedCarService(record);
    setIsInvoiceModalVisible(true);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-content");
    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Service Invoice</title>
              <style>
                @page {
                  size: A4;
                  margin: 0;
                }
                body { 
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                }
                .invoice-container { padding: 20px; }
                .text-center { text-align: center; }
                .mb-8 { margin-bottom: 2rem; }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
                .gap-8 { gap: 2rem; }
                .font-bold { font-weight: bold; }
                .text-right { text-align: right; }
                .border { border: 1px solid #ddd; }
                .rounded-lg { border-radius: 0.5rem; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .text-xl { font-size: 1.25rem; }
                .mt-8 { margin-top: 2rem; }
                .pt-4 { padding-top: 1rem; }
                .border-t { border-top: 1px solid #ddd; }
                .company-info { margin-bottom: 2rem; }
                .company-info p { margin: 0.25rem 0; }
                @media print {
                  body { 
                    margin: 0;
                    padding: 20px;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  .no-print { display: none; }
                  @page {
                    margin: 0;
                    size: A4;
                  }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const columns = [
    {
      title: "Car Details",
      key: "carInfo",
      render: (_: string, record: CarService) => (
        <>
          <div>
            <CarOutlined />{" "}
            <Tag color="default">{record.carPlate.toUpperCase()}</Tag>
            {record.carDetails && (
              <Popover content={record.carDetails} title="Details">
                <InfoCircleOutlined
                  style={{ cursor: "pointer", color: "blue" }}
                />
              </Popover>
            )}
          </div>
          <div className="font-bold">
            <UserOutlined /> {record.ownerName}
          </div>
          <div>
            <PhoneOutlined /> {record.phoneNo}
          </div>
        </>
      ),
    },
    {
      title: "In / Out",
      key: "carInOut",
      render: (_: string, record: CarService) => (
        <>
          <div>
            <LeftSquareTwoTone twoToneColor="#52c41a" />{" "}
            {dayjs(record.carInDateTime).format("DD-MM-YYYY HH:mm")}
          </div>
          <div>
            <RightSquareTwoTone twoToneColor="#ff4d4f" />{" "}
            {record.carOutDateTime
              ? dayjs(record.carOutDateTime).format("DD-MM-YYYY HH:mm")
              : "..."}
          </div>
        </>
      ),
    },
    {
      title: "Services",
      key: "carServiceItems",
      render: (_: string, record: CarService) => {
        return (
          <div>
            {record.carServiceItems.map((item, index) => (
              <div key={item.id}>
                {index + 1}. {item.name} x{item.quantity}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: "Final Amount",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (text: number) => `$${text.toFixed(2)}`,
    },
    {
      title: "Payment",
      key: "payment",
      render: (_: string, record: CarService) => {
        return (
          <>
            <div>
              <DollarOutlined /> ${record.paidInCash}
            </div>
            <div>
              <CreditCardOutlined /> ${record.paidInCard}
            </div>
          </>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_: string, record: CarService) => {
        return (
          <>
            {record.discountType && record.discountAmount && (
              <Tag color="green">Discount</Tag>
            )}
            {record.finalAmount -
              (record.paidInCash ?? 0) -
              (record.paidInCard ?? 0) !==
              0 && <Tag color="red">Payment</Tag>}
          </>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: string, record: CarService) => (
        <Space>
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => handleViewInvoice(record)}
          />
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
    const finalAmount = carServices.reduce(
      (sum, service) => sum + service.finalAmount,
      0
    );
    const totalCash = carServices.reduce(
      (sum, service) => sum + (service.paidInCash ?? 0),
      0
    );
    const totalCard = carServices.reduce(
      (sum, service) => sum + (service.paidInCard ?? 0),
      0
    );

    return {
      totalServices,
      finalAmount,
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
        <Card title="Total Amount">${summary.finalAmount.toFixed(2)}</Card>
        <Card title="Paid in Cash">${summary.totalCash.toFixed(2)}</Card>
        <Card title="Paid in Card">${summary.totalCard.toFixed(2)}</Card>
      </div>

      <h2 className="text-xl font-bold mt-4">Active Car Service</h2>
      <Table
        dataSource={activeCarServices}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={loading}
      />

      <h2 className="text-xl font-bold mt-4">Completed Car Service</h2>
      <Table
        dataSource={completedCarServices}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={loading}
      />

      <Modal
        title={editingCarService ? "Edit Car Service" : "Add Car Service"}
        open={isModalVisible}
        onOk={handleSubmit}
        confirmLoading={loading}
        onCancel={() => setIsModalVisible(false)}
        width={1200}
      >
        <Form<CarService>
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
                        {form.getFieldValue([
                          "carServiceItems",
                          name,
                          "serviceType",
                        ]) === "PARTS" ? (
                          <AutoComplete
                            options={supplyNames.map((name) => ({
                              value: name,
                            }))}
                            placeholder="Name"
                            onSearch={debouncedFetchSupplyNames}
                          />
                        ) : (
                          <Input placeholder="Name" />
                        )}
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
                    onClick={() =>
                      add({
                        serviceType: "SERVICE",
                        name: "",
                        price: 0,
                        quantity: 1,
                        totalAmount: 0,
                      })
                    }
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
            <Form.Item name="totalAmount" label="Total Amount">
              <InputNumber style={{ width: "100%" }} prefix="$" disabled />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-4">
            <Form.Item name="discountType" label="Discount Type">
              <Select>
                <Select.Option value="PERCENTAGE">Percentage</Select.Option>
                <Select.Option value="FIXED">Fixed</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="discountAmount" label="Discount Value">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="finalAmount" label="Final Amount">
              <InputNumber style={{ width: "100%" }} prefix="$" disabled />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-4">
            <Form.Item name="gstAmount" label="GST Amount">
              <InputNumber style={{ width: "100%" }} prefix="$" disabled />
            </Form.Item>
          </div>

          <div className="flex gap-4 justify-end items-center">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                form.setFieldsValue({
                  paidInCash: form.getFieldValue("finalAmount"),
                });
              }}
            />
            <Form.Item name="paidInCash" label="Paid in Cash">
              <InputNumber style={{ width: "100%" }} prefix="$" />
            </Form.Item>
          </div>
          <div className="flex gap-4 justify-end items-center">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                form.setFieldsValue({
                  paidInCard: form.getFieldValue("finalAmount"),
                });
              }}
            />
            <Form.Item name="paidInCard" label="Paid in Card">
              <InputNumber style={{ width: "100%" }} prefix="$" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        open={isInvoiceModalVisible}
        onCancel={() => setIsInvoiceModalVisible(false)}
        footer={[
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Print Invoice
          </Button>,
        ]}
        width={800}
      >
        {selectedCarService && (
          <div id="invoice-content" className="p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">
                {companySettings.companyName}
              </h1>
              <div className="company-info">
                <p>{companySettings.address}</p>
                <p>Phone: {companySettings.phoneNumber}</p>
                <p>Email: {companySettings.email}</p>
                {companySettings.abn && <p>ABN: {companySettings.abn}</p>}
                {companySettings.website && (
                  <p>Website: {companySettings.website}</p>
                )}
              </div>
            </div>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold">Tax Invoice</h2>
              <p className="text-gray-600">
                Invoice #{selectedCarService.id.slice(-6).toUpperCase()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="font-bold mb-2">Customer Information</h2>
                <p>
                  <UserOutlined /> {selectedCarService.ownerName}
                </p>
                <p>
                  <PhoneOutlined /> {selectedCarService.phoneNo}
                </p>
              </div>
              <div>
                <h2 className="font-bold mb-2">Vehicle Information</h2>
                <p>
                  <CarOutlined /> {selectedCarService.carPlate.toUpperCase()}
                </p>
                {selectedCarService.carDetails && (
                  <p>{selectedCarService.carDetails}</p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="font-bold mb-2">Service Details</h2>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Service/Part</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Quantity</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCarService.carServiceItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-right">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">
                          ${item.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="font-bold mb-2">Service Date</h2>
                <p>
                  {dayjs(selectedCarService.carInDateTime).format(
                    "DD-MM-YYYY HH:mm"
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <span className="font-bold">Subtotal:</span> $
                  {selectedCarService.totalAmount.toFixed(2)}
                </div>
                {selectedCarService.discountType &&
                  selectedCarService.discountAmount && (
                    <div className="mb-2">
                      <span className="font-bold">Discount:</span> $
                      {selectedCarService.discountAmount.toFixed(2)}
                      {selectedCarService.discountType === "PERCENTAGE" &&
                        " (%)"}
                    </div>
                  )}

                <div className="text-xl font-bold">
                  <span>Total incl. GST:</span> $
                  {selectedCarService.finalAmount.toFixed(2)}
                </div>
                <div className="mb-2">
                  <span className="font-bold">GST amount:</span> $
                  {selectedCarService.gstAmount?.toFixed(2)}
                </div>
              </div>
            </div>
            <hr />
            <div>
              <div>Price includes GST</div>
              <div>
                All goods remain in the property of the vendor until the invoice
                is paid in full.
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
