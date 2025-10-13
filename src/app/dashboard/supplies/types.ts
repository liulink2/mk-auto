import { Dayjs } from "dayjs";

export interface SupplyItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  totalAmount: number;
  gstAmount: number;
}

export interface Supplier {
  id: string;
  name: string;
  parent?: Supplier;
  children: Supplier[];
}

export interface Supply {
  id: string;
  supplierId: string;
  supplier: Supplier;
  invoiceNumber: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  totalAmount: number;
  gstAmount: number;
  paymentType: "CASH" | "CARD";
  remarks?: string;
  suppliedDate: Dayjs;
  mappedNames: string[];
  settled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplyFormValues {
  invoiceNumber: string;
  supplierId: string;
  suppliedDate: Dayjs;
  month: number;
  year: number;
  paymentType: "CASH" | "CARD";
  remarks?: string;
  items: SupplyItem[];
}
