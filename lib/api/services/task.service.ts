import { apiClient } from "../client";
import type { Task, CreateTaskRequest, TaskStatus } from "../types";

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskRequest): Promise<Task> {
    return apiClient.post<Task>("/api/tasks/", data);
}

/**
 * Get tasks for a project
 * @param projectId - The project ID
 * @param myTasksOnly - If true, only return tasks assigned to current user
 */
export async function getProjectTasks(
    projectId: number,
    myTasksOnly = false
): Promise<Task[]> {
    const params: Record<string, string> = myTasksOnly ? { my_tasks: "true" } : {};
    return apiClient.get<Task[]>(`/api/project/${projectId}/tasks`, { params });
}

/**
 * Update task status
 */
export async function updateTaskStatus(
    taskId: number,
    status: TaskStatus
): Promise<Task> {
    return apiClient.put<Task>(`/api/tasks/${taskId}/status`, { status });
}
