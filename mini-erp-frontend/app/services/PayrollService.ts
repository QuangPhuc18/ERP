import httpAxios from "./httpAxios";

// Định nghĩa kiểu dữ liệu gửi lên
export interface PayrollRequest {
    employeeId: number;
    month: number;
    year: number;
}

export interface TimesheetRequest {
    employeeId: number;
    date: string;
    checkInTime: string;
    checkOutTime?: string | null;
    breakHours?: number;
    note?: string;
}

const PayrollService = {
  // 1. Hàm tính lương (Bạn đã có sẵn)
  calculateAndSave: async (data: PayrollRequest) => {
    const response = await httpAxios.post("/Payroll/calculate", data);
    return response.data;
  },

  submitTimesheet: async (data: TimesheetRequest) => {
    const response = await httpAxios.post("/Payroll/timesheet", data);
    return response.data;
  },

  // 2. 🎯 HÀM BỊ THIẾU: Lấy danh sách lương theo tháng/năm
  getList: async (month: number, year: number) => {
    const response = await httpAxios.get(`/Payroll/list?month=${month}&year=${year}`);
    return response.data;
  },
  
  markAsPaid: async (id: number) => {
    const response = await httpAxios.put(`/Payroll/${id}/pay`);
    return response.data;
  },
  
  getTimesheetsSummary: async (month: number, year: number) => {
    const response = await httpAxios.get(`/Payroll/timesheets-summary?month=${month}&year=${year}`);
    return response.data;
  },

  getTimesheetLogs: async (employeeId: number, month: number, year: number) => {
    const response = await httpAxios.get(`/Payroll/timesheet-logs?employeeId=${employeeId}&month=${month}&year=${year}`);
    return response.data;
  },

  getAdvances: async (month: number, year: number) => {
    const response = await httpAxios.get(`/Payroll/advances?month=${month}&year=${year}`);
    return response.data;
  },

  createAdvance: async (data: any) => {
    const response = await httpAxios.post(`/Payroll/advances`, data);
    return response.data;
  }
};

export default PayrollService;