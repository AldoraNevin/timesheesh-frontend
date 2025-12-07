# API Service Documentation

API service untuk berkomunikasi dengan backend di `http://localhost:8000`.

## Struktur

- `client.ts` - Base API client dengan error handling dan token management
- `types.ts` - Type definitions untuk semua request/response
- `services/` - Service modules untuk setiap kategori endpoint
  - `auth.service.ts` - Authentication (login, register)
  - `profile.service.ts` - User profile
  - `dashboard.service.ts` - Dashboard data
  - `admin.service.ts` - Admin operations (user management)
  - `project.service.ts` - Project CRUD operations
  - `health.service.ts` - Health check

## Penggunaan

### Import Services

```typescript
import { 
  authService, 
  profileService, 
  dashboardService,
  adminService,
  projectService,
  healthService 
} from "@/lib/api";
```

### Authentication

```typescript
// Login
try {
  const response = await authService.login({
    email: "user@example.com",
    password: "password123"
  });
  console.log("Token:", response.token);
} catch (error) {
  console.error("Login failed:", error.message);
}

// Register
const response = await authService.register({
  email: "user@example.com",
  password: "password123",
  name: "John Doe"
});

// Logout
authService.logout();
```

### Profile

```typescript
const profile = await profileService.getProfile();
```

### Dashboard

```typescript
const dashboard = await dashboardService.getDashboard();
```

### Projects

```typescript
// Get all projects
const projects = await projectService.getAllProjects();

// Get project by ID
const project = await projectService.getProjectByID(1);

// Create project
const newProject = await projectService.createProject({
  name: "New Project",
  client: "Client Name",
  color: "#10B981",
  isPublic: true
});

// Update project
const updated = await projectService.updateProject(1, {
  name: "Updated Name"
});

// Delete project
await projectService.deleteProject(1);
```

### Admin Operations

```typescript
// Get all users
const users = await adminService.getAllUsers();

// Get user by ID
const user = await adminService.getUserByID(1);

// Create user
const newUser = await adminService.createUser({
  email: "user@example.com",
  password: "password123",
  name: "John Doe"
});

// Update user
const updated = await adminService.updateUser(1, {
  name: "Updated Name"
});

// Delete user
await adminService.deleteUser(1);
```

### Health Check

```typescript
const health = await healthService.checkHealth();
```

## Error Handling

Semua service methods akan throw error jika request gagal. Error object memiliki struktur:

```typescript
{
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
```

Contoh error handling:

```typescript
try {
  const projects = await projectService.getAllProjects();
} catch (error: any) {
  if (error.status === 401) {
    // Unauthorized - token expired atau invalid
    // Token sudah di-clear otomatis, redirect ke login
  } else {
    console.error("Error:", error.message);
  }
}
```

## Token Management

Token disimpan di `localStorage` dengan key `auth_token`. Token akan:
- Otomatis ditambahkan ke header Authorization untuk semua request yang memerlukan auth
- Otomatis di-clear jika mendapat response 401 Unauthorized
- Bisa di-manage manual dengan `apiClient.setToken()` dan `apiClient.clearToken()`

## Environment Variable

Untuk mengubah base URL, set environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Default: `http://localhost:8000`

