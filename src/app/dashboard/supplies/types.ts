export interface Supply {
  id: string;
  invoiceNumber: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  paymentType: "CASH" | "CARD";
  remarks: string;
  suppliedDate: string;
  supplier: {
    name: string;
  };
}
