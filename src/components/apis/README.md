# API Helper Documentation

This folder contains all API integration logic for the Flowboard application. All API calls should be made through these helper modules instead of using `useAxios` or `useUser` directly.

## Structure

```
apis/
├── index.ts           # Central export point for all APIs
├── axiosInstance.ts   # Configured axios instance with auth interceptor
├── auth.ts            # Authentication APIs (login, register, logout)
├── users.ts           # User management APIs
├── projects.ts        # Project management APIs
└── tasks.ts           # Task management APIs
```

## Usage

### Authentication

```typescript
import { authApi } from '../apis';

// Login
const response = await authApi.login({ email, password });
// Token and user are automatically stored in localStorage

// Register
await authApi.register(userData);

// Logout
authApi.logout();

// Check authentication status
const isAuth = authApi.isAuthenticated();

// Get current user from localStorage
const user = authApi.getCurrentUser();

// Get token from localStorage
const token = authApi.getToken();
```

### Tasks

```typescript
import { tasksApi } from '../apis';

// Get all tasks
const tasks = await tasksApi.getTasks();

// Get task by ID
const task = await tasksApi.getTaskById(taskId);

// Create task
const newTask = await tasksApi.createTask(taskData);

// Update task (full replace)
const updated = await tasksApi.updateTask(taskId, taskData);

// Partial update
const patched = await tasksApi.patchTask(taskId, { status: 'done' });

// Delete task
await tasksApi.deleteTask(taskId);
```

### Projects

```typescript
import { projectsApi } from '../apis';

// Get all projects
const projects = await projectsApi.getAllProjects();

// Get project by ID
const project = await projectsApi.getProjectById(projectId);

// Create project
const newProject = await projectsApi.createProject(projectData);

// Update project
const updated = await projectsApi.updateProject(projectId, projectData);

// Delete project
await projectsApi.deleteProject(projectId);
```

### Users

```typescript
import { usersApi } from '../apis';

// Get current authenticated user from API
const me = await usersApi.getCurrentUser();

// Get user by ID
const user = await usersApi.getUserById(userId);
```

## Key Features

### Automatic JWT Token Handling

All API requests automatically include the JWT token in the `Authorization` header via an axios interceptor. No need to manually add tokens to requests.

```typescript
// Token is automatically added
const tasks = await tasksApi.getTasks();
// Header: Authorization: Bearer <token>
```

### Centralized Error Handling

All API calls throw errors that can be caught with try/catch:

```typescript
try {
  const response = await authApi.login(credentials);
  navigate('/home');
} catch (error) {
  setFormError(error.message);
}
```

### Type Safety

All APIs are fully typed with TypeScript interfaces:

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}
```

## Migration Guide

### Old Pattern (deprecated)
```typescript
import { useUser } from '../../hooks/useUser';
import { useAxios } from '../../hooks/useAxios';

const { login } = useUser();
const { fetchData } = useAxios<LoginResponse>();

const result = await fetchData('/api/auth/login', {
  method: 'POST',
  data: credentials,
});
login(result);
```

### New Pattern (recommended)
```typescript
import { authApi } from '../apis';

await authApi.login(credentials);
// Token and user automatically stored
```

## Notes

- `useUser` hook is still available for accessing user context in components
- `useAxios` hook is deprecated for new code; use API helpers instead
- All token and user management is handled automatically by the API layer
- Backend base URL: `https://flowboard-backend.azurewebsites.net/`
