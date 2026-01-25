import { apiClient } from "../client";
import type { Timesheet, ClockInRequest, ClockOutRequest, ManualLogRequest } from "../types";

export const timesheetService = {
    // POST /api/timesheets/clock-in
    async clockIn(data: ClockInRequest): Promise<Timesheet> {
        return apiClient.post<Timesheet>("/api/timesheets/clock-in", data);
    },

    // POST /api/timesheets/clock-out
    async clockOut(data: ClockOutRequest): Promise<{ message: string; data: Timesheet }> {
        return apiClient.post<{ message: string; data: Timesheet }>("/api/timesheets/clock-out", data);
    },

    // GET /api/timesheets/my-logs
    async getMyLogs(): Promise<Timesheet[]> {
        return apiClient.get<Timesheet[]>("/api/timesheets/my-logs");
    },

    // POST /api/timesheets/log
    async createManualLog(data: ManualLogRequest): Promise<Timesheet> {
        return apiClient.post<Timesheet>("/api/timesheets/log", data);
    },

    // DELETE /api/timesheets/log
    async deleteWeekLogs(data: any): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>("/api/timesheets/log", data);
    },

    // PUT /api/timesheets/:id
    async updateTimesheet(id: number | string, data: any): Promise<Timesheet> {
        return apiClient.put<Timesheet>(`/api/timesheets/${id}`, data);
    },

    // DELETE /api/timesheets/:id
    async deleteTimesheet(id: number | string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/api/timesheets/${id}`);
    },
};
