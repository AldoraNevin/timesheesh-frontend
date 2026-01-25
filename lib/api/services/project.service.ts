// Project Service

import { apiClient } from "../client";
import type {
  Project,
  ProjectMember,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginatedProjectsResponse,
} from "../types";

export const projectService = {
  // POST /api/project/create
  async createProject(data: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>("/api/project/create", data);
  },

  // PUT /api/project/update/:projectId
  async updateProject(
    projectId: number | string,
    data: UpdateProjectRequest
  ): Promise<Project> {
    return apiClient.put<Project>(`/api/project/update/${projectId}`, data);
  },

  // DELETE /api/project/delete/:id
  async deleteProject(id: number | string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/project/delete/${id}`);
  },

  // GET /api/getproject
  async getAllProjects(): Promise<Project[]> {
    const response = await apiClient.get<PaginatedProjectsResponse>("/api/getproject");
    // Extract data array from paginated response
    return response.data || [];
  },

  // GET /api/getproject/:id
  async getProjectByID(id: number | string): Promise<Project> {
    return apiClient.get<Project>(`/api/getproject/${id}`);
  },

  // GET /api/project/:projectId/members
  async getProjectMembers(projectId: number | string): Promise<ProjectMember[]> {
    return apiClient.get<ProjectMember[]>(`/api/project/${projectId}/members`);
  },
};

