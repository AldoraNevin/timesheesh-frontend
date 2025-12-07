// Auth Service - Login dan Register
// Langsung call backend API

import { apiClient } from "../client";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types";

export const authService = {
  // POST /api/auth/login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/login",
      credentials,
      false // Tidak perlu auth untuk login
    );

    // Simpan token jika ada
    if (response.token) {
      apiClient.setToken(response.token);
    }

    return response;
  },

  // POST /api/auth/register
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/register",
      data,
      false // Tidak perlu auth untuk register
    );

    // Simpan token jika ada
    if (response.token) {
      apiClient.setToken(response.token);
    }

    return response;
  },

  // Logout - clear token
  logout(): void {
    apiClient.clearToken();
  },
};

