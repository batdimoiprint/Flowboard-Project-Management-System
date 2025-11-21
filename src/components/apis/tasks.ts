import axiosInstance from './axiosInstance';

export interface CreateTaskData {
    category?: string; // API uses 'category'
    categoryId?: string; // Keep for backward compatibility
    projectId?: string; // Add projectId for tasks
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
    projectId?: string;
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
        text?: string;
        content?: string | null;
        createdAt: string;
    }>;
}

export const tasksApi = {
    createTask: async (taskData: CreateTaskData): Promise<TaskResponse> => {
        // Transform the data to match API expectations
        const payload = {
            ...taskData,
            projectId: taskData.projectId || undefined,
            // Use 'category' for API, fallback to categoryId
            category: taskData.category || taskData.categoryId,
            categoryId: undefined, // Remove categoryId from payload
            status: taskData.status.toLowerCase().replace(' ', ' '), // e.g., "To Do" -> "to do"
            comments: taskData.comments ? [{
                authorId: taskData.createdBy,
                content: taskData.comments,
                createdAt: new Date().toISOString(),
            }] : [{
                authorId: taskData.createdBy,
                content: "Initial task created",
                createdAt: new Date().toISOString(),
            }],
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
            projectId: taskData.projectId || undefined,
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
            categoryId: string;
            projectId: string;
            startDate: string;
            endDate: string;
            assignedTo: string;
        }> = {};

        // Only include fields that are provided
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.priority !== undefined && updates.priority !== '') payload.priority = updates.priority;
        if (updates.status !== undefined && updates.status !== '') payload.status = updates.status.toLowerCase();
        if (updates.categoryId !== undefined && updates.categoryId !== '') {
            (payload as any).categoryId = updates.categoryId;
            payload.category = updates.categoryId; // include non-ID alias too
        } else if (updates.category !== undefined && updates.category !== '') {
            payload.category = updates.category;
            // Include categoryId alias in case backend expects categoryId for partial updates
            (payload as any).categoryId = updates.category;
        }
        if (updates.projectId !== undefined && updates.projectId !== '') payload.projectId = updates.projectId;
        if (updates.startDate !== undefined) payload.startDate = updates.startDate;
        if (updates.endDate !== undefined) payload.endDate = updates.endDate;
        if (updates.assignedTo !== undefined) payload.assignedTo = updates.assignedTo;

        const response = await axiosInstance.patch<TaskResponse>(`/api/tasks/${taskId}`, payload);
        return response.data;
    },

    deleteTask: async (taskId: string): Promise<void> => {
        await axiosInstance.delete(`/api/tasks/${taskId}`);
    },

    addComment: async (taskId: string, commentData: { authorId: string; text: string }): Promise<TaskResponse> => {
        const payload = {
            authorId: commentData.authorId,
            text: commentData.text,
            createdAt: new Date().toISOString(),
        };
        const response = await axiosInstance.post<TaskResponse>(`/api/tasks/${taskId}/comments`, payload);
        return response.data;
    },
};