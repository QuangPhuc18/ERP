import httpAxios from "./httpAxios";

export interface EmployeeSchedule {
    id: number;
    employeeId: number;
    employeeName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    notes?: string;
}

export interface CreateScheduleDTO {
    employeeId: number;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
}

const ScheduleService = {
    getSchedules: async (startDate: string, endDate: string): Promise<EmployeeSchedule[]> => {
        try {
            const response = await httpAxios.get(`/Schedules?startDate=${startDate}&endDate=${endDate}`);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    createSchedule: async (data: CreateScheduleDTO): Promise<EmployeeSchedule> => {
        try {
            const response = await httpAxios.post("/Schedules", data);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    deleteSchedule: async (id: number): Promise<void> => {
        try {
            await httpAxios.delete(`/Schedules/${id}`);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
};

export default ScheduleService;
