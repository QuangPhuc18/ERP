import httpAxios from "./httpAxios";

export interface Unit {
  id: number;
  name: string;
  description?: string;
}

export const getUnits = async (): Promise<Unit[]> => {
  const response = await httpAxios.get("/Units");
  return response.data;
};
