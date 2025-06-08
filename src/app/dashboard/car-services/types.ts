export interface CarServiceItem {
  id: string;
  serviceType: string;
  name: string;
  price: number;
  quantity: number;
  totalAmount: number;
  settled: boolean;
}

export interface CarService {
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
  odo: number;
  isInvoiceIssued: boolean;
}
