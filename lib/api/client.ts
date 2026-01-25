// Base API Client dengan error handling dan token management

import type { ApiError } from "./types";

const API_BASE_URL = "http://localhost:8000";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Get token from localStorage
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  // Set token to localStorage
  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  }

  // Remove token from localStorage
  clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  }

  // Build headers dengan token jika ada
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Handle response
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle network errors (CORS, connection issues, etc.)
    if (!response.ok && response.status === 0) {
      throw {
        message: "Network error. Pastikan backend berjalan dan CORS dikonfigurasi dengan benar.",
        status: 0,
      };
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let data: unknown;
    try {
      if (isJson) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch {
      // If response is not JSON and not text, it might be empty or error
      data = { message: "Invalid response from server" };
    }

    if (!response.ok) {
      const errorData = data as Record<string, unknown>;
      const error: ApiError = {
        message: (errorData?.message as string) || (errorData?.error as string) || "An error occurred",
        status: response.status,
        errors: errorData?.errors as Record<string, string[]> | undefined,
      };

      // Handle 401 Unauthorized - clear token
      if (response.status === 401) {
        this.clearToken();
        // Optionally redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      // Handle 404 - might be CORS issue
      if (response.status === 404) {
        error.message = "Endpoint tidak ditemukan. Pastikan backend berjalan dan endpoint benar.";
      }

      throw error;
    }

    return data as T;
  }

  // GET request
  async get<T>(
    endpoint: string,
    options: { params?: Record<string, string>; includeAuth?: boolean } = {}
  ): Promise<T> {
    const { params, includeAuth = true } = options;
    let url = `${this.baseURL}${endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(includeAuth),
      mode: "cors",
      credentials: "omit",
    });

    return this.handleResponse<T>(response);
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
      mode: "cors", // Explicitly set CORS mode
      credentials: "omit", // Don't send credentials for CORS
    });

    return this.handleResponse<T>(response);
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
      mode: "cors", // Explicitly set CORS mode
      credentials: "omit", // Don't send credentials for CORS
    });

    return this.handleResponse<T>(response);
  }

  // DELETE request
  async delete<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
      mode: "cors", // Explicitly set CORS mode
      credentials: "omit", // Don't send credentials for CORS
    });

    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

