import { Modal, Button } from "antd";
import {
  PrinterOutlined,
  UserOutlined,
  PhoneOutlined,
  CarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import React from "react";
import { CarService } from "../types";

interface CarServiceInvoiceModalProps {
  isInvoiceModalVisible: boolean;
  setIsInvoiceModalVisible: (visible: boolean) => void;
  selectedCarService: CarService | null;
  companySettings: any;
  handlePrint: () => void;
}

const CarServiceInvoiceModal: React.FC<CarServiceInvoiceModalProps> = ({
  isInvoiceModalVisible,
  setIsInvoiceModalVisible,
  selectedCarService,
  companySettings,
  handlePrint,
}) => {
  return (
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
                    {selectedCarService.discountType === "PERCENTAGE" && " (%)"}
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
  );
};

export default CarServiceInvoiceModal;
