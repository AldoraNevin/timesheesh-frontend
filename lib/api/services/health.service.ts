// Health Service

import { apiClient } from "../client";

export const healthService = {
  // GET /health
  async checkHealth(): Promise<{ status: string; message?: string }> {
    return apiClient.get<{ status: string; message?: string }>(
      "/health",
      false // Tidak perlu auth untuk health check
    );
  },
};

