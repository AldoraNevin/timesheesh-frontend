// Dashboard Service

import { apiClient } from "../client";
import type { Dashboard } from "../types";

export const dashboardService = {
  // GET /api/dashboard
  async getDashboard(): Promise<Dashboard> {
    return apiClient.get<Dashboard>("/api/dashboard");
  },
};

