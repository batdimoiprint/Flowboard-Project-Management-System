import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://flowboard-backend.azurewebsites.net/',
});

// Add auth token if available
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface CreateTaskData {
    category?: string; // API uses 'category'
    categoryId?: string; // Keep for backward compatibility
    assignedTo: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    startDate: string;
    endDate: string;
    createdBy: string;
    comments?: string; // Optional comment text from form
}

export interface TaskResponse {
    _id: string;
    category?: string; // API uses 'category' instead of 'categoryId'
    categoryId?: string; // Keep for backward compatibility
    assignedTo: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    startDate: string;
    endDate: string;
    createdBy: string;
    createdAt?: string;
    comments: Array<{
        authorId: string;
        text: string;
        createdAt: string;
    }>;
}

export const tasksApi = {
    createTask: async (taskData: CreateTaskData): Promise<TaskResponse> => {
        // Transform the data to match API expectations
        const payload = {
            ...taskData,
            // Use 'category' for API, fallback to categoryId
            category: taskData.category || taskData.categoryId,
            categoryId: undefined, // Remove categoryId from payload
            status: taskData.status.toLowerCase().replace(' ', ' '), // e.g., "To Do" -> "to do"
            comments: taskData.comments ? [{
                authorId: taskData.createdBy, // Assuming createdBy is the author
                text: taskData.comments,
                createdAt: new Date().toISOString(),
            }] : [],
        };

        const response = await axiosInstance.post<TaskResponse>('/api/tasks', payload);
        return response.data;
    },

    getTasks: async (): Promise<TaskResponse[]> => {
        const response = await axiosInstance.get<TaskResponse[]>('/api/tasks');
        return response.data;
    },

    getTaskById: async (taskId: string): Promise<TaskResponse> => {
        const response = await axiosInstance.get<TaskResponse>(`/api/tasks/${taskId}`);
        return response.data;
    },

    updateTask: async (taskId: string, taskData: Partial<CreateTaskData>): Promise<TaskResponse> => {
        const payload = {
            ...taskData,
            // Use 'category' for API, fallback to categoryId
            category: taskData.category || taskData.categoryId,
            categoryId: undefined, // Remove categoryId from payload
            status: taskData.status ? taskData.status.toLowerCase().replace(' ', ' ') : undefined,
        };

        const response = await axiosInstance.put<TaskResponse>(`/api/tasks/${taskId}`, payload);
        return response.data;
    },

    patchTask: async (taskId: string, updates: Partial<CreateTaskData>): Promise<TaskResponse> => {
        const payload: Partial<{
            title: string;
            description: string;
            priority: string;
            status: string;
            category: string;
            startDate: string;
            endDate: string;
            assignedTo: string;
        }> = {};

        // Only include fields that are provided
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.priority !== undefined) payload.priority = updates.priority;
        if (updates.status !== undefined) payload.status = updates.status.toLowerCase();
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.startDate !== undefined) payload.startDate = updates.startDate;
        if (updates.endDate !== undefined) payload.endDate = updates.endDate;
        if (updates.assignedTo !== undefined) payload.assignedTo = updates.assignedTo;

        const response = await axiosInstance.patch<TaskResponse>(`/api/tasks/${taskId}`, payload);
        return response.data;
    },

    deleteTask: async (taskId: string): Promise<void> => {
        await axiosInstance.delete(`/api/tasks/${taskId}`);
    },
};