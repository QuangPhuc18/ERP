import httpAxios from "./httpAxios";

// Cập nhật lại DTO: Thêm costPrice và categoryId để phục vụ Form Thêm/Sửa
export interface ProductDTO {
  id: number;
  productCode: string;
  productName: string;
  price: number;
  costPrice: number;
  quantity: number;
  categoryId: number;
  categoryName?: string; // Dấu ? nghĩa là không bắt buộc phải gửi lên khi Thêm/Sửa
  imageUrl?: string;
  description?: string;
  isNew?: boolean;
  isActive?: boolean; // 🎯 Trạng thái ngừng kinh doanh
}

const ProductService = {
  // 1. Lấy danh sách sản phẩm
  getAll: async (): Promise<ProductDTO[]> => {
    const response = await httpAxios.get("/Products");
    return response.data;
  },
  
  // 2. Thêm mới sản phẩm (Bỏ qua id và categoryName khi gửi lên)
  create: async (data: Omit<ProductDTO, 'id' | 'categoryName'>): Promise<ProductDTO> => {
    const response = await httpAxios.post("/Products", data);
    return response.data;
  },
  
  // 3. Cập nhật sản phẩm
  update: async (id: number, data: Omit<ProductDTO, 'id' | 'categoryName'>): Promise<ProductDTO> => {
    const response = await httpAxios.put(`/Products/${id}`, data);
    return response.data;
  },
  
  // 4. Xóa sản phẩm
  delete: async (id: number): Promise<void> => {
    await httpAxios.delete(`/Products/${id}`);
  },

  // 🎯 Bật / Tắt trạng thái ngừng kinh doanh
  toggleStatus: async (id: number): Promise<{ message: string, isActive: boolean }> => {
    const response = await httpAxios.put(`/Products/${id}/toggle-status`);
    return response.data;
  }
};

export default ProductService;