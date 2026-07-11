import httpAxios from "./httpAxios";

// 1. Kiểu dữ liệu cho từng dòng sản phẩm trong hóa đơn
export interface OrderDetailDTO {
  productId: number;
  productName?: string; // Có thể null khi gửi lên, chỉ dùng để hiển thị UI
  quantity: number;
  unitPrice: number;
  unitId?: number | null;
}

// 2. Kiểu dữ liệu khi gửi API tạo Đơn hàng mới
export interface OrderCreateDTO {
  customerId: number | null;
  workShiftId?: number | null;
  totalAmount?: number;
  amountPaid?: number;
  paymentMethod?: string;
  note?: string;
  details: OrderDetailDTO[];
}

// 3. Kiểu dữ liệu khi lấy danh sách Hóa đơn từ C# về
export interface OrderDTO {
  id: number;
  customerName?: string;
  orderDate: string;
  totalAmount: number;
  status: string; // "Completed" hoặc "Cancelled"
  details?: OrderDetailDTO[];
}

const OrderService = {
  // Lấy danh sách toàn bộ hóa đơn
  getAll: async (): Promise<OrderDTO[]> => {
    const response = await httpAxios.get("/Orders");
    return response.data;
  },

  // Tạo hóa đơn mới (Lưu ý C# sẽ tự động trừ kho)
  create: async (data: OrderCreateDTO): Promise<OrderDTO> => {
    const response = await httpAxios.post("/Orders", data);
    return response.data;
  },

  // Hủy hóa đơn (Lưu ý C# sẽ tự động hoàn trả số lượng vào kho)
  cancel: async (id: number): Promise<void> => {
    await httpAxios.put(`/Orders/${id}/cancel`);
  }
};

export default OrderService;