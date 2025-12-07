// Admin Service - User Management

import { apiClient } from "../client";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  AuthResponse,
} from "../types";

export const adminService = {
  // POST /api/admin/register
  async registerAdmin(data: CreateUserRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/api/admin/register", data);
  },

  // GET /api/admin/users
  async getAllUsers(): Promise<User[]> {
    return apiClient.get<User[]>("/api/admin/users");
  },

  // GET /api/admin/users/:id
  async getUserByID(id: number | string): Promise<User> {
    return apiClient.get<User>(`/api/admin/users/${id}`);
  },

  // POST /api/admin/users
  async createUser(data: CreateUserRequest): Promise<User> {
    return apiClient.post<User>("/api/admin/users", data);
  },

  // PUT /api/admin/users/:id
  async updateUser(
    id: number | string,
    data: UpdateUserRequest
  ): Promise<User> {
    return apiClient.put<User>(`/api/admin/users/${id}`, data);
  },

  // DELETE /api/admin/users/:id
  async deleteUser(id: number | string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/admin/users/${id}`);
  },
};

