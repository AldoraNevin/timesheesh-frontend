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

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

