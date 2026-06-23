import httpAxios from "./httpAxios";

export interface DepartmentDTO {
  id?: number;
  name: string;
  description: string;
}

const DepartmentService = {
  getAll: async () => {
    const response = await httpAxios.get("/Departments");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await httpAxios.get(`/Departments/${id}`);
    return response.data;
  },

  create: async (data: DepartmentDTO) => {
    const response = await httpAxios.post("/Departments", data);
    return response.data;
  },

  update: async (id: number, data: DepartmentDTO) => {
    const response = await httpAxios.put(`/Departments/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await httpAxios.delete(`/Departments/${id}`);
    return response.data;
  }
};

export default DepartmentService;