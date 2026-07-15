import httpAxios from "./httpAxios";

export interface OnlineOrderDetail {
  productId: number;
  quantity: number;
}

export interface OnlineOrderRequest {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod: string;
  shippingMethod?: string;
  shippingFee: number;
  pointsUsed?: number;
  details: OnlineOrderDetail[];
}

const CheckoutService = {
  createOrder: async (request: OnlineOrderRequest) => {
    try {
      const response = await httpAxios.post("/Storefront/orders", request);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng Online:", error);
      throw error;
    }
  },
  getCustomerPoints: async (phone: string) => {
    try {
      const response = await httpAxios.get(`/Storefront/customers/${phone}/points`);
      return response.data; // Trả về { rewardPoints: ... }
    } catch (error) {
      console.error("Lỗi khi lấy điểm:", error);
      return { rewardPoints: 0 };
    }
  }
};

export default CheckoutService;
