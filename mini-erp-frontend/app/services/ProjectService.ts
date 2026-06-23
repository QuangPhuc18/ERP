import httpAxios from "./httpAxios";

export interface ProjectDTO {
  id?: number;
  name: string;
  description: string;
  status?: string; // Ví dụ: Đang chạy, Hoàn thành
}

const ProjectService = {
  // GET /api/Projects: Lấy danh sách dự án
  getAll: async () => {
    const response = await httpAxios.get("/Projects");
    return response.data;
  },

  // POST /api/Projects: Tạo dự án mới
  create: async (data: ProjectDTO) => {
    const response = await httpAxios.post("/Projects", data);
    return response.data;
  },

  // POST /api/Projects/{id}/assign: Phân công nhân viên vào dự án
  assignEmployee: async (projectId: number, employeeId: number) => {
    const response = await httpAxios.post(`/Projects/${projectId}/assign`, { employeeId });
    return response.data;
  }
};

export default ProjectService;