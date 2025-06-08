"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Button,
  Modal,
  Form,
  DatePicker,
  Space,
  Tag,
  Popconfirm,
  App,
  Popover,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CarOutlined,
  CreditCardOutlined,
  DollarOutlined,
  LeftSquareTwoTone,
  RightSquareTwoTone,
  FileTextOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { debounce } from "lodash";
import { Supply } from "@prisma/client";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { CarService } from "./types";
import CarServiceForm from "./components/CarServiceForm";
import CarServiceTable from "./components/CarServiceTable";
import CarServiceInvoiceModal from "./components/CarServiceInvoiceModal";
import SummaryCards from "./components/SummaryCards";

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
      odo: 0,
      isInvoiceIssued: false,
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
                .whitespace-pre-line { white-space: pre-line; }
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
          <div>
            <DashboardOutlined /> {record.odo}
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
            {record.isInvoiceIssued && <Tag color="blue">Invoice</Tag>}
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

      <SummaryCards summary={summary} />

      <h2 className="text-xl font-bold mt-4">Active Car Service</h2>
      <CarServiceTable
        dataSource={activeCarServices}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <h2 className="text-xl font-bold mt-4">Completed Car Service</h2>
      <CarServiceTable
        dataSource={completedCarServices}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingCarService ? "Edit Car Service" : "Add Car Service"}
        open={isModalVisible}
        onOk={handleSubmit}
        confirmLoading={loading}
        onCancel={() => setIsModalVisible(false)}
        width={1200}
        footer={[
          <Button key="cancel" danger onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            {editingCarService ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <CarServiceForm
          form={form}
          supplyNames={supplyNames}
          debouncedFetchSupplyNames={debouncedFetchSupplyNames}
          handleValuesChange={handleValuesChange}
        />
      </Modal>

      <CarServiceInvoiceModal
        isInvoiceModalVisible={isInvoiceModalVisible}
        setIsInvoiceModalVisible={setIsInvoiceModalVisible}
        handlePrint={handlePrint}
        selectedCarService={selectedCarService}
        companySettings={companySettings}
      />
    </div>
  );
}
