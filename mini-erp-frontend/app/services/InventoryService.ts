import httpAxios from "./httpAxios";

export interface InventoryTransactionDTO {
  id: number;
  transactionDate: string;
  productId: number;
  productName: string;
  transactionType: string;
  quantity: number;
  referenceId?: number;
  note?: string;
}

export interface InventoryCheckDTO {
  id: number;
  productCode: string;
  productName: string;
  systemStock: number;
}

// MỚI: Interface cho Phiếu Kiểm Kho
export interface StockTakeDetailDTO {
  id: number;
  productId: number;
  productName: string;
  systemStock: number;
  actualStock: number;
  difference: number;
  reason?: string;
}

export interface StockTakeDTO {
  id: number;
  code: string;
  checkDate: string;
  status: string;
  note?: string;
  employeeName: string;
  itemsCount: number;
  details: StockTakeDetailDTO[];
}

export interface ReconciliationDTO {
  id: number;
  productCode: string;
  productName: string;
  historyStock: number;
  systemStock: number;
  isMatch: boolean;
  difference: number;
}

export interface PaginatedTransactions {
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  data: InventoryTransactionDTO[];
}

export const InventoryService = {
  // Lấy lịch sử giao dịch (Đã tối ưu phân trang)
  getTransactions: async (params?: { 
    filterType?: string, 
    dateFilter?: string, 
    startDate?: string, 
    endDate?: string,
    page?: number,
    pageSize?: number
  }): Promise<PaginatedTransactions> => {
    const response = await httpAxios.get("/Inventory/Transactions", { params });
    return response.data;
  },

  // Lấy danh sách tồn kho hệ thống để kiểm
  getInventoryForCheck: async (): Promise<InventoryCheckDTO[]> => {
    const response = await httpAxios.get("/Inventory/Check");
    return response.data;
  },

  // 🎯 ĐỐI SOÁT DỮ LIỆU TỰ ĐỘNG
  getReconciliation: async (): Promise<ReconciliationDTO[]> => {
    const response = await httpAxios.get("/Inventory/Reconcile");
    return response.data;
  },

  // Lấy danh sách Phiếu Kiểm Kho
  getStockTakes: async (): Promise<StockTakeDTO[]> => {
    const response = await httpAxios.get("/Inventory/StockTakes");
    return response.data;
  },

  // Gửi kết quả đếm tay (Bước 1)
  createStockTake: async (data: { note?: string; items: any[] }): Promise<any> => {
    const response = await httpAxios.post("/Inventory/StockTakes", data);
    return response.data;
  },

  // Xác nhận điều chỉnh kho (Bước 2)
  confirmStockTake: async (stockTakeId: number): Promise<any> => {
    const response = await httpAxios.post(`/Inventory/StockTakes/${stockTakeId}/Confirm`);
    return response.data;
  }
};
