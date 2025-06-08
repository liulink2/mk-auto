"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Space,
  Button,
  Input,
  Modal,
  Form,
  Select,
  App,
  Tag,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  WarningOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { Supply } from "../supplies/types";
import { CarService, CarServiceItem } from "../car-services/types";

interface InventoryItem {
  id: string;
  name: string;
  totalQuantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  lastUsedDate?: string;
  mappedNames: string[];
  price: number;
  settled: boolean;
}

export default function InventoryPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isMappingModalVisible, setIsMappingModalVisible] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<InventoryItem | null>(
    null
  );
  const [mappingForm] = Form.useForm();
  const [serviceItemNames, setServiceItemNames] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const [suppliesResponse, carServicesResponse] = await Promise.all([
        fetch("/api/supplies?includeSettled=false"),
        fetch("/api/car-services?includeSettled=false"),
      ]);

      if (!suppliesResponse.ok || !carServicesResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const supplies: Supply[] = await suppliesResponse.json();
      const carServices: CarService[] = await carServicesResponse.json();

      // Get all unique service item names
      const uniqueServiceNames = new Set<string>();
      carServices.forEach((service: CarService) => {
        service.carServiceItems.forEach((item: CarServiceItem) => {
          if (item.serviceType === "PARTS") {
            uniqueServiceNames.add(item.name);
          }
        });
      });
      setServiceItemNames(Array.from(uniqueServiceNames));

      // Calculate inventory
      const inventoryMap = new Map<string, InventoryItem>();

      // First, add all supplies
      supplies.forEach((supply) => {
        inventoryMap.set(supply.name, {
          id: supply.id,
          name: supply.name,
          totalQuantity: supply.quantity,
          usedQuantity: 0,
          remainingQuantity: supply.quantity,
          price: Number(supply.price),
          mappedNames: supply.mappedNames || [],
          settled: supply.settled || false,
        });
      });

      // Then, calculate usage from car services
      carServices.forEach((service: CarService) => {
        service.carServiceItems.forEach((item: CarServiceItem) => {
          if (item.serviceType === "PARTS") {
            // Find the supply that matches either by name or mapped names
            const matchingSupply = Array.from(inventoryMap.values()).find(
              (supply) =>
                supply.name === item.name ||
                supply.mappedNames.includes(item.name)
            );

            if (matchingSupply) {
              matchingSupply.usedQuantity += item.quantity;
              matchingSupply.remainingQuantity -= item.quantity;
              matchingSupply.lastUsedDate = service.carInDateTime;
            }
          }
        });
      });

      setInventory(Array.from(inventoryMap.values()));
    } catch {
      message.error("Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleMapping = (record: InventoryItem) => {
    setSelectedSupply(record);
    mappingForm.setFieldsValue({
      mappedNames: record.mappedNames,
    });
    setIsMappingModalVisible(true);
  };

  const handleMappingSubmit = async (values: { mappedNames: string[] }) => {
    if (!selectedSupply) return;

    try {
      const response = await fetch(
        `/api/supplies/${selectedSupply.id}/mapping`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mappedNames: values.mappedNames }),
        }
      );

      if (!response.ok) throw new Error("Failed to update mapping");

      message.success("Mapping updated successfully");
      setIsMappingModalVisible(false);
      fetchInventory();
    } catch {
      message.error("Failed to update mapping");
    }
  };

  const handleSettle = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select items to settle");
      return;
    }

    try {
      const response = await fetch("/api/inventory/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplyIds: selectedRowKeys,
        }),
      });

      if (!response.ok) throw new Error("Failed to settle items");

      message.success("Items settled successfully");
      setSelectedRowKeys([]);
      fetchInventory();
    } catch {
      message.error("Failed to settle items");
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys as string[]);
    },
  };

  const columns = [
    {
      title: "Supply Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: InventoryItem) => (
        <Space>
          {text}
          {record.mappedNames.length > 0 && (
            <Tooltip title={`Mapped to: ${record.mappedNames.join(", ")}`}>
              <Tag color="blue">Mapped</Tag>
            </Tooltip>
          )}
          {record.settled && (
            <Tooltip title="Settled">
              <Tag color="green">Settled</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Total Quantity",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
    },
    {
      title: "Used Quantity",
      dataIndex: "usedQuantity",
      key: "usedQuantity",
    },
    {
      title: "Remaining",
      dataIndex: "remainingQuantity",
      key: "remainingQuantity",
      render: (quantity: number) => (
        <Space>
          {quantity}
          {quantity <= 0 && (
            <Tooltip title="Out of stock">
              <WarningOutlined style={{ color: "red" }} />
            </Tooltip>
          )}
          {quantity > 0 && quantity < 5 && (
            <Tooltip title="Low stock">
              <WarningOutlined style={{ color: "orange" }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Last Used",
      dataIndex: "lastUsedDate",
      key: "lastUsedDate",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: string, record: InventoryItem) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleMapping(record)}
          title="Edit Mapping"
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Space>
          <Input
            placeholder="Search supplies..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleSettle}
            disabled={selectedRowKeys.length === 0}
          >
            Settle Selected
          </Button>
          <Button type="primary" onClick={fetchInventory}>
            Refresh
          </Button>
        </Space>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={inventory.filter((item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase())
        )}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      />

      <Modal
        title="Edit Name Mapping"
        open={isMappingModalVisible}
        onCancel={() => setIsMappingModalVisible(false)}
        onOk={() => mappingForm.submit()}
      >
        <Form form={mappingForm} onFinish={handleMappingSubmit}>
          <Form.Item
            name="mappedNames"
            label="Mapped Service Item Names"
            tooltip="Add names that should be considered as the same item in car services"
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Enter service item names"
              options={serviceItemNames.map((name) => ({
                label: name,
                value: name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
