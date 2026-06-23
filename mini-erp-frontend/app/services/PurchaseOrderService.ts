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

// 3. Dữ liệu nhận về khi lấy Danh sách phiếu nhập
export interface PurchaseOrderDTO {
  id: number;
  supplierName?: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  details?: PurchaseOrderDetailDTO[];
}

const PurchaseOrderService = {
  // Lấy danh sách toàn bộ phiếu nhập kho
  getAll: async (): Promise<PurchaseOrderDTO[]> => {
    const response = await httpAxios.get("/PurchaseOrders");
    return response.data;
  },

  // Gửi request tạo phiếu nhập (C# sẽ tự động cộng tồn kho khi nhận được)
  create: async (data: PurchaseOrderCreateDTO): Promise<PurchaseOrderDTO> => {
    const response = await httpAxios.post("/PurchaseOrders", data);
    return response.data;
  }
};

export default PurchaseOrderService;