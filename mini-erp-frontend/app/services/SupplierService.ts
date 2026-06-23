import httpAxios from "./httpAxios";

export interface SupplierDTO {
  id: number;
  supplierCode: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

const SupplierService = {
  getAll: async (): Promise<SupplierDTO[]> => {
    const response = await httpAxios.get("/Suppliers");
    return response.data;
  },
  create: async (data: Partial<SupplierDTO>) => {
    const response = await httpAxios.post("/Suppliers", data);
    return response.data;
  },
  update: async (id: number, data: Partial<SupplierDTO>) => {
    const response = await httpAxios.put(`/Suppliers/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await httpAxios.delete(`/Suppliers/${id}`);
    return response.data;
  }
};

export default SupplierService;