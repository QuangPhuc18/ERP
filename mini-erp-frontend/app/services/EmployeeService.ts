import httpAxios from "./httpAxios";

// Khai báo khuôn DTO cho code an toàn (TypeScript)
export interface EmployeeDTO {
  id?: number; // C# tự sinh nên id là tùy chọn (optional)
  fullName: string;
  email: string;
  departmentId: number;
  dailySalary?: number;
  employeeType?: string;
  hourlyRate?: number;
}

const EmployeeService = {
  // Lấy toàn bộ danh sách nhân viên
  getAll: async () => {
    const response = await httpAxios.get("/Employees");
    return response.data; // Chỉ lấy phần data, bỏ qua header của axios
  },

  // Lấy 1 nhân viên theo ID
  getById: async (id: number) => {
    const response = await httpAxios.get(`/Employees/${id}`);
    return response.data;
  },

  // Tạo nhân viên mới (Gửi JSON thuần lên C#)
  create: async (data: EmployeeDTO) => {
    const response = await httpAxios.post("/Employees", data);
    return response.data;
  },

  // Cập nhật nhân viên
  update: async (id: number, data: EmployeeDTO) => {
    const response = await httpAxios.put(`/Employees/${id}`, data);
    return response.data;
  },

  // Xóa nhân viên
  delete: async (id: number) => {
    const response = await httpAxios.delete(`/Employees/${id}`);
    return response.data;
  },
  createBulk: async (data: EmployeeDTO[]): Promise<string> => {
    const response = await httpAxios.post("/Employees/bulk", data);
    return response.data;
  }
};

export default EmployeeService;