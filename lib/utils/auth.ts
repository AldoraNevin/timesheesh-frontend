// Auth utility functions

/**
 * Check if user is authenticated (has token)
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("auth_token");
  return !!token;
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Clear auth token
 */
export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
}

