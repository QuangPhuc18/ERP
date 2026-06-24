import httpAxios from "./httpAxios";

export interface WorkShiftDTO {
  id: number;
  employeeId: number;
  employeeName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  expectedCash: number;
  expectedTransfer: number;
  expectedDebt: number;
  actualCash: number;
  variance: number;
  status: string;
  totalItems?: number;
}

const WorkShiftService = {
  // Lấy danh sách toàn bộ ca (dành cho Admin)
  getAll: async (): Promise<WorkShiftDTO[]> => {
    const response = await httpAxios.get("/WorkShifts");
    return response.data;
  },

  // Lấy ca đang mở hiện tại của nhân viên đang đăng nhập
  getCurrent: async (): Promise<WorkShiftDTO> => {
    const response = await httpAxios.get("/WorkShifts/Current");
    return response.data;
  },

  // Mở ca mới
  openShift: async (startingCash: number): Promise<WorkShiftDTO> => {
    const response = await httpAxios.post("/WorkShifts/Open", { startingCash });
    return response.data;
  },

  // Đóng ca (Kiểm đếm mù)
  closeShift: async (id: number, actualCash: number): Promise<any> => {
    const response = await httpAxios.post(`/WorkShifts/${id}/Close`, { actualCash });
    return response.data; // Trả về thông điệp và Z-Report
  }
};

export default WorkShiftService;
