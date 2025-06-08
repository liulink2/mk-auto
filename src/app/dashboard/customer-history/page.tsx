"use client";

import { useState } from "react";
import { Input, Button, Table, Space, App, Tag, Popover } from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  CarOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  UserOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { CarService, CarServiceItem } from "../car-services/types";
import CarServiceInvoiceModal from "../car-services/components/CarServiceInvoiceModal";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";

export default function CustomerHistoryPage() {
  const { message } = App.useApp();
  const companySettings = useCompanySettings();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [carServices, setCarServices] = useState<CarService[]>([]);
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [selectedCarService, setSelectedCarService] =
    useState<CarService | null>(null);

  const handleSearch = async () => {
    if (!searchText.trim()) {
      message.warning("Please enter search text");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/car-services/search?q=${encodeURIComponent(searchText)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch car services");
      }
      const data = await response.json();
      setCarServices(data);
    } catch {
      message.error("Failed to search car services");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record: CarService) => {
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
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "carInDateTime",
      key: "carInDateTime",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
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
      title: "Services",
      dataIndex: "carServiceItems",
      key: "carServiceItems",
      render: (items: CarServiceItem[]) => (
        <>
          {items.map((item, index) => (
            <div key={item.id}>
              {index + 1}. {item.name} x{item.quantity}
            </div>
          ))}
        </>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: CarService) => (
        <Button
          type="text"
          icon={<FileTextOutlined />}
          onClick={() => handleViewDetails(record)}
          title="View Details"
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer History</h1>

      <div className="mb-6">
        <Space.Compact style={{ width: "100%", maxWidth: "600px" }}>
          <Input
            placeholder="Search by customer name, phone, or car plate"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
          >
            Search
          </Button>
        </Space.Compact>
      </div>

      <Table
        columns={columns}
        dataSource={carServices}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      />

      <CarServiceInvoiceModal
        isInvoiceModalVisible={isInvoiceModalVisible}
        setIsInvoiceModalVisible={setIsInvoiceModalVisible}
        selectedCarService={selectedCarService}
        companySettings={companySettings}
        handlePrint={handlePrint}
      />
    </div>
  );
}
