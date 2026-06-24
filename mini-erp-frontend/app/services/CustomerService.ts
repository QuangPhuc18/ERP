import httpAxios from "./httpAxios";

export interface CustomerDTO {
  id: number;
  customerCode?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

const CustomerService = {
  getAll: async (): Promise<CustomerDTO[]> => {
    const response = await httpAxios.get<CustomerDTO[]>("/Customers");
    return response.data;
  },
  update: async (id: number, data: Omit<CustomerDTO, "id" | "customerCode">) => {
    const response = await httpAxios.put(`/Customer/${id}`, data);
    return response.data;
  },
  create: async (data: Omit<CustomerDTO, "id">) => {
    const response = await httpAxios.post("/Customers", data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await httpAxios.delete(`/Customers/${id}`);
    return response.data;
  }
};

export default CustomerService;