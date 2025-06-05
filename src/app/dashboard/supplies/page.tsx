"use client";

import { useState, useEffect } from "react";
import {
  Card,
  DatePicker,
  Space,
  Button,
  Divider,
  Typography,
  App,
  Form,
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons";
import { Supply, SupplyFormValues } from "./types";
import { useSupplies } from "./hooks/useSupplies";
import { useSuppliers } from "./hooks/useSuppliers";
import { compressImage } from "./utils/imageUtils";
import { SupplyTable } from "./components/SupplyTable";
import { AddSupplyModal } from "./components/AddSupplyModal";
import { EditSupplyModal } from "./components/EditSupplyModal";
import { SummaryModal } from "./components/SummaryModal";
import { InvoiceDetailsModal } from "./components/InvoiceDetailsModal";

const { Text } = Typography;

export default function SupplyManagementPage() {
  const { message } = App.useApp();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [isInvoiceDetailsModalVisible, setIsInvoiceDetailsModalVisible] =
    useState(false);
  const [selectedInvoiceItems, setSelectedInvoiceItems] = useState<Supply[]>(
    []
  );
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  // Custom hooks
  const { date, setDate, supplies, loading, fetchSupplies } =
    useSupplies(message);
  const { suppliers, fetchSuppliers } = useSuppliers(message);

  useEffect(() => {
    fetchSupplies(date);
    fetchSuppliers();
  }, [date, fetchSupplies, fetchSuppliers]);

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
      const items = values.items.map((item) => ({
        invoiceNumber: values.invoiceNumber,
        supplierId: values.supplierId,
        suppliedDate: values.suppliedDate.toISOString(),
        paymentType: values.paymentType,
        remarks: values.remarks,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        totalAmount: item.totalAmount,
        gstAmount: item.gstAmount,
      }));
      const response = await fetch("/api/supplies/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      if (!response.ok) throw new Error("Failed to create supplies");
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
      let totalGstAmount = 0;
      allValues.items.forEach((item) => {
        const itemPrice = item.price * item.quantity;
        item.gstAmount = Math.round(itemPrice * 0.1 * 100) / 100;
        item.totalAmount = Math.round((itemPrice + item.gstAmount) * 100) / 100;
        totalAmount += item.totalAmount;
        totalGstAmount += item.gstAmount;
      });
      addForm.setFieldsValue({
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalGstAmount: Math.round(totalGstAmount * 100) / 100,
        items: allValues.items,
      });
    }
  };

  const handleEditValuesChange = (
    changedValues: Partial<Supply>,
    allValues: Supply
  ) => {
    if (changedValues.price || changedValues.quantity) {
      const itemPrice = (allValues.price ?? 0) * (allValues.quantity ?? 0);
      const gstAmount = Math.round(itemPrice * 0.1 * 100) / 100;
      const totalAmount = Math.round((itemPrice + gstAmount) * 100) / 100;
      editForm.setFieldsValue({
        ...allValues,
        gstAmount,
        totalAmount,
      });
    }
  };

  const handleEditSubmit = async (values: Supply) => {
    if (!editingSupply) return;
    try {
      const response = await fetch(`/api/supplies/${editingSupply.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values }),
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
      const response = await fetch(`/api/supplies/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete supply");
      message.success("Supply deleted successfully");
      fetchSupplies(date);
    } catch {
      message.error("Failed to delete supply");
    }
  };

  const showInvoiceDetails = (invoiceNumber: string) => {
    const invoiceItems = supplies.filter(
      (supply) => supply.invoiceNumber === invoiceNumber
    );
    setSelectedInvoiceItems(invoiceItems);
    setIsInvoiceDetailsModalVisible(true);
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const imageBase64 = await compressImage(file);
      const response = await fetch("/api/supplies/extract-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      if (!response.ok) throw new Error("Failed to extract invoice data");

      const { data }: { data: SupplyFormValues } = await response.json();
      const totalGstAmount = data.items.reduce(
        (sum, item) => sum + Number(item.gstAmount) || 0,
        0
      );
      const totalAmount = data.items.reduce(
        (sum, item) => sum + Number(item.totalAmount) || 0,
        0
      );

      addForm.setFieldsValue({
        invoiceNumber: data.invoiceNumber,
        supplierId: data.supplierId,
        suppliedDate: data.suppliedDate ? dayjs(data.suppliedDate) : undefined,
        paymentType: data.paymentType || "CARD",
        items: data.items.map((item) => ({
          name: item.name,
          description: item.description || "",
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          gstAmount: Number(item.gstAmount) || 0,
          totalAmount: Number(item.totalAmount) || 0,
        })),
        totalAmount: totalAmount,
        totalGstAmount: totalGstAmount,
      });
      message.success("Invoice data extracted successfully");
    } catch {
      message.error("Failed to extract invoice data");
    } finally {
      setUploading(false);
    }
    return false;
  };

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
                  (sum, supply) => sum + Number(supply.totalAmount),
                  0
                )
              )}
            </div>
          </div>
        </div>
      </Card>
      <Divider />
      <SupplyTable
        supplies={supplies}
        loading={loading}
        showEditSupplyModal={showEditSupplyModal}
        handleDelete={handleDelete}
        showInvoiceDetails={showInvoiceDetails}
      />
      <AddSupplyModal
        visible={isAddModalVisible}
        onCancel={handleAddCancel}
        onSubmit={handleSubmit}
        suppliers={suppliers}
        loading={loading}
        uploading={uploading}
        handleUpload={handleUpload}
        addForm={addForm}
        handleValuesChange={handleValuesChange}
      />
      <EditSupplyModal
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
        onSubmit={handleEditSubmit}
        suppliers={suppliers}
        loading={loading}
        editForm={editForm}
        handleEditValuesChange={handleEditValuesChange}
        editingSupply={editingSupply}
      />
      <SummaryModal
        visible={isSummaryModalVisible}
        onCancel={() => setIsSummaryModalVisible(false)}
        supplies={supplies}
      />
      <InvoiceDetailsModal
        visible={isInvoiceDetailsModalVisible}
        onCancel={() => setIsInvoiceDetailsModalVisible(false)}
        selectedInvoiceItems={selectedInvoiceItems}
      />
    </div>
  );
}
