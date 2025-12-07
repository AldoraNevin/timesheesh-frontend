// Profile Service

import { apiClient } from "../client";
import type { Profile } from "../types";

export const profileService = {
  // GET /api/profile
  async getProfile(): Promise<Profile> {
    return apiClient.get<Profile>("/api/profile");
  },
};

