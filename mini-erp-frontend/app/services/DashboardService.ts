import httpAxios from "./httpAxios";

export interface DashboardSummaryDTO {
  totalRevenue: number;
  totalExpense: number;
  profit: number;
  employeeCount: number;
  lowStockCount: number;
}

const DashboardService = {
  getSummary: async (): Promise<DashboardSummaryDTO> => {
    const response = await httpAxios.get("/Dashboard/summary");
    return response.data;
  }
};

export default DashboardService;