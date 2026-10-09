import {
  Form,
  Input,
  DatePicker,
  Select,
  AutoComplete,
  InputNumber,
  Button,
  FormInstance,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import React from "react";
import { CarService, CarSuggestion, CarSuggestionField } from "../types";

interface CarServiceFormProps {
  form: FormInstance<CarService>;
  supplyNames: string[];
  debouncedFetchSupplyNames: (searchText: string) => void;
  carSuggestions: Partial<Record<CarSuggestionField, CarSuggestion[]>>;
  debouncedFetchCarSuggestions: (
    field: CarSuggestionField,
    searchText: string
  ) => void;
  handleValuesChange: (_: Partial<CarService>, values: CarService) => void;
}

const CarServiceForm: React.FC<CarServiceFormProps> = ({
  form,
  supplyNames,
  debouncedFetchSupplyNames,
  carSuggestions,
  debouncedFetchCarSuggestions,
  handleValuesChange,
}) => {
  // Picking a past car fills plate, owner and phone from its latest visit.
  const renderCarAutoComplete = (field: CarSuggestionField) => (
    <AutoComplete
      options={(carSuggestions[field] ?? []).map((suggestion) => ({
        key: suggestion.carPlate,
        value: suggestion[field] ?? "",
        label: (
          <div>
            <div>
              {suggestion.carPlate} - {suggestion.ownerName}
            </div>
            <div className="text-xs text-gray-500">
              {[suggestion.phoneNo, suggestion.carDetails]
                .filter(Boolean)
                .join(" | ")}
            </div>
          </div>
        ),
        suggestion,
      }))}
      filterOption={false}
      onSearch={(searchText) => debouncedFetchCarSuggestions(field, searchText)}
      onSelect={(_, option) => {
        const { carPlate, ownerName, phoneNo } = option.suggestion;
        form.setFieldsValue({ carPlate, ownerName, phoneNo });
      }}
    />
  );

  return (
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
          {renderCarAutoComplete("carPlate")}
        </Form.Item>

        <Form.Item
          name="ownerName"
          label="Owner Name"
          rules={[{ required: true }]}
        >
          {renderCarAutoComplete("ownerName")}
        </Form.Item>

        <Form.Item name="phoneNo" label="Phone No" rules={[{ required: true }]}>
          {renderCarAutoComplete("phoneNo")}
        </Form.Item>

        <Form.Item name="carDetails" label="Car Details" className="col-span-2">
          <Input />
        </Form.Item>

        <Form.Item name="odo" label="Odometer">
          <InputNumber style={{ width: "100%" }} />
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
          name="isInvoiceIssued"
          label="Invoice Issued"
          valuePropName="checked"
        >
          <Select>
            <Select.Option value={true}>Yes</Select.Option>
            <Select.Option value={false}>No</Select.Option>
          </Select>
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
                        options={supplyNames.map((name) => ({ value: name }))}
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
                    rules={[{ required: true, message: "Missing quantity" }]}
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
  );
};

export default CarServiceForm;
