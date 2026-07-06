import httpAxios from "./httpAxios";
import { PagedResult } from "./PurchaseOrderService";

export interface UnpaidPurchaseOrderDTO {
  id: number;
  supplierName: string;
  orderDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string; // "Unpaid", "Partial"
}

export interface PaymentHistoryItemDTO {
  id: number;
  amount: number;
  paymentDate: string;
  note: string;
}

export interface PaymentHistoryDTO {
  id: number;
  supplierName: string;
  orderDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string; // "Partial", "Paid"
  payments: PaymentHistoryItemDTO[];
}

export const PayableService = {
  // Lấy danh sách công nợ
  getUnpaidPurchaseOrders: async (page: number = 1, pageSize: number = 20, month?: number, year?: number): Promise<PagedResult<UnpaidPurchaseOrderDTO>> => {
    let url = `/PurchaseOrders/Unpaid?page=${page}&pageSize=${pageSize}`;
    if (month && year) url += `&month=${month}&year=${year}`;
    const response = await httpAxios.get(url);
    return response.data;
  },

  // Lấy lịch sử giao dịch thanh toán
  getPaymentHistory: async (page: number = 1, pageSize: number = 20, month?: number, year?: number): Promise<PagedResult<PaymentHistoryDTO>> => {
    let url = `/PurchaseOrders/History?page=${page}&pageSize=${pageSize}`;
    if (month && year) url += `&month=${month}&year=${year}`;
    const response = await httpAxios.get(url);
    return response.data;
  },

  // Thanh toán
  payPurchaseOrder: async (id: number, amountToPay: number): Promise<{ message: string, paidAmount: number, remainingAmount: number, paymentStatus: string }> => {
    const response = await httpAxios.post(`/PurchaseOrders/${id}/Pay`, amountToPay, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }
};
export default PayableService;
