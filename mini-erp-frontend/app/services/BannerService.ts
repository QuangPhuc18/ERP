import httpAxios from "./httpAxios";

export interface BannerDTO {
  id: number;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  isActive: boolean;
}

const BannerService = {
  getAll: async (): Promise<BannerDTO[]> => {
    const response = await httpAxios.get("/Banners");
    return response.data;
  },

  create: async (data: Omit<BannerDTO, "id">): Promise<BannerDTO> => {
    const response = await httpAxios.post("/Banners", data);
    return response.data;
  },

  update: async (id: number, data: Omit<BannerDTO, "id">): Promise<BannerDTO> => {
    const response = await httpAxios.put(`/Banners/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await httpAxios.delete(`/Banners/${id}`);
  },

  toggleStatus: async (id: number): Promise<{ message: string, isActive: boolean }> => {
    const response = await httpAxios.put(`/Banners/${id}/toggle-status`);
    return response.data;
  }
};

export default BannerService;
