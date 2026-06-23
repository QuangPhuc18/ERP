import httpAxios from "./httpAxios";

// Khai báo kiểu dữ liệu
export interface CategoryDTO {
  id: number;
  name: string;
}

const CategoryService = {
  // Lấy toàn bộ danh mục
  getAll: async (): Promise<CategoryDTO[]> => {
    const response = await httpAxios.get("/Categories");
    return response.data;
  },

  // Thêm mới danh mục
  create: async (data: { name: string }): Promise<CategoryDTO> => {
    const response = await httpAxios.post("/Categories", data);
    return response.data;
  },

  // Cập nhật danh mục
  update: async (id: number, data: { name: string }): Promise<CategoryDTO> => {
    const response = await httpAxios.put(`/Categories/${id}`, data);
    return response.data;
  },

  // Xóa danh mục
  delete: async (id: number): Promise<void> => {
    await httpAxios.delete(`/Categories/${id}`);
  }
};

export default CategoryService;