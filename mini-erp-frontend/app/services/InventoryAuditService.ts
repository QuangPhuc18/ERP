import httpAxios from "./httpAxios";

export interface AuditResultDTO {
  productId: number;
  productName: string;
  historyStock: number;
  currentStock: number;
  difference: number;
  isSafe: boolean;
}

export const InventoryAuditService = {
  checkIntegrity: async (): Promise<AuditResultDTO[]> => {
    const response = await httpAxios.get("/InventoryAudit/Check");
    return response.data;
  },
};
