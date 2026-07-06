import httpAxios from "./httpAxios";

// 1. Chi tiết từng sản phẩm nhập kho
export interface PurchaseOrderDetailDTO {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number; // Giá vốn nhập vào
}

// 2. Dữ liệu gửi lên khi Tạo phiếu nhập
export interface PurchaseOrderCreateDTO {
  supplierId: number; // ID nhà cung cấp
  details: PurchaseOrderDetailDTO[];
}

export interface PurchaseOrderDTO {
  id: number;
  supplierName?: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  details?: PurchaseOrderDetailDTO[];
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

const PurchaseOrderService = {
  // Lấy danh sách toàn bộ phiếu nhập kho
  getAll: async (page: number = 1, pageSize: number = 20, month?: number, year?: number): Promise<PagedResult<PurchaseOrderDTO>> => {
    let url = `/PurchaseOrders?page=${page}&pageSize=${pageSize}`;
    if (month && year) url += `&month=${month}&year=${year}`;
    const response = await httpAxios.get(url);
    return response.data;
  },

  // 2. Lập phiếu nhập kho nháp (Pending)
  create: async (data: PurchaseOrderCreateDTO): Promise<{ message: string, purchaseOrderId: number, totalAmount: number }> => {
    const response = await httpAxios.post("/PurchaseOrders", data);
    return response.data;
  },

  // 3. Sửa phiếu nhập kho nháp (Pending)
  update: async (id: number, data: PurchaseOrderCreateDTO): Promise<{ message: string, totalAmount: number }> => {
    const response = await httpAxios.put(`/PurchaseOrders/${id}`, data);
    return response.data;
  },

  // 4. Duyệt phiếu nhập kho (Completed)
  confirm: async (id: number): Promise<{ message: string }> => {
    const response = await httpAxios.post(`/PurchaseOrders/${id}/Confirm`);
    return response.data;
  }
};

export default PurchaseOrderService;