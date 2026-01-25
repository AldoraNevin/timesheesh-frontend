// Type definitions untuk API requests dan responses

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string; // Backend menggunakan full_name
}

export interface AuthResponse {
  token: string;
  user?: User;
  message?: string;
}

// User Role enum - sesuai dengan backend
export type UserRole = "admin" | "projectmanager" | "employee" | "finance";

// Employee Type enum - sesuai dengan backend
export type EmployeeType = "fulltime" | "parttime" | "freelance";

// User Types - sesuai dengan backend model
export interface User {
  id: number;
  email: string;
  full_name: string; // Backend menggunakan full_name, bukan name
  role: UserRole;
  employee_type?: EmployeeType | null; // Nullable, hanya untuk employee role
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  employee_type?: EmployeeType | null; // Optional, hanya untuk employee role
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  full_name?: string;
  role?: UserRole;
  employee_type?: EmployeeType | null;
}

// Profile Types - sama dengan User karena profile adalah current user
export interface Profile {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  employee_type?: EmployeeType | null;
  created_at: string;
  updated_at: string;
}

// Dashboard Types
export interface Dashboard {
  totalProjects?: number;
  totalHours?: number;
  totalUsers?: number;
  recentActivity?: unknown[];
  [key: string]: unknown;
}

// Budget Type enum - sesuai dengan backend
export type BudgetType = "project_based" | "user_based";

// Project Types - sesuai dengan backend model
export interface Project {
  id: number;
  name: string;
  client_name: string; // Backend menggunakan client_name
  client_email?: string | null; // Nullable
  budget_type: BudgetType;

  // Project Based Budget fields (nullable)
  budgeted_hours?: number | null;
  hour_threshold?: number | null;
  budget_cost?: number | null; // dalam rupiah
  budget_cost_threshold?: number | null; // dalam rupiah
  budget_revenue?: number | null; // dalam rupiah

  // User Based Budget fields (nullable)
  cost_per_hour?: number | null; // dalam rupiah
  rate_per_hour?: number | null; // dalam rupiah

  created_at: string;
  updated_at: string;

  // Frontend-only fields untuk display (optional)
  tracked?: string;
  amount?: string;
  progress?: string;
  access?: "Public" | "Private";
  starred?: boolean;
  color?: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role_in_project: string;
  user: User;
}

export interface CreateProjectRequest {
  name: string;
  client_name: string;
  client_email?: string | null;
  budget_type: BudgetType;

  // Project Based Budget fields
  budgeted_hours?: number | null;
  hour_threshold?: number | null;
  budget_cost?: number | null;
  budget_cost_threshold?: number | null;
  budget_revenue?: number | null;

  // User Based Budget fields
  cost_per_hour?: number | null;
  rate_per_hour?: number | null;
}

export interface UpdateProjectRequest {
  name?: string;
  client_name?: string;
  client_email?: string | null;
  budget_type?: BudgetType;

  // Project Based Budget fields
  budgeted_hours?: number | null;
  hour_threshold?: number | null;
  budget_cost?: number | null;
  budget_cost_threshold?: number | null;
  budget_revenue?: number | null;

  // User Based Budget fields
  cost_per_hour?: number | null;
  rate_per_hour?: number | null;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// Paginated Response for Projects
export interface PaginatedProjectsResponse {
  data: Project[];
  pagination: {
    limit: number;
    page: number;
    total: number;
  };
}

export interface PaginatedUsersResponse {
  data: User[];
  pagination: {
    limit: number;
    page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Task Types - sesuai dengan backend model
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: number;
  project_id: number;
  created_by_id: number;
  assigned_to_id: number;
  title: string;
  description: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  project_id: number;
  assigned_to_id?: number;
  role?: UserRole;
  title: string;
  description?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

// Timesheet Types - sesuai dengan backend model
export type TimesheetStatus = "pending" | "approved" | "rejected";

export interface Timesheet {
  id: number;
  user_id: number;
  project_id: number;
  task_id?: number | null;
  description?: string; // Standardized for tracker/manual entries
  duration_minutes: number;
  duration_seconds: number;
  clock_in: string;
  clock_out?: string | null;
  face_similarity_score: number;
  status: TimesheetStatus;
  rejection_note?: string;
  approved_by_id?: number | null;
  created_at: string;
  updated_at: string;

  // Relations
  project?: Project;
  task?: Task;
  user?: User;
}

export interface ClockInRequest {
  project_id: number;
  task_id?: number | null;
  face_similarity_score: number;
  description?: string;
}

export interface ClockOutRequest {
  description: string;
}

export interface ManualLogRequest {
  project_id: number;
  task_id?: number | null;
  date: string; // YYYY-MM-DD
  duration_seconds: number;
  description?: string;
}

export interface DeleteWeekLogsRequest {
  project_id: number;
  task_id?: number | null;
  week_start: string; // YYYY-MM-DD (Monday)
}
