import axiosInstance from './axiosInstance';

export interface CreateSubTaskData {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    mainTaskId?: string;
    projectId: string;
    category?: string;
    categoryId?: string;
    createdBy?: string;
    assignedTo?: string[];
    startDate?: string;
    endDate?: string;
}

export interface UpdateSubTaskData {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    mainTaskId?: string;
    projectId?: string;
    category?: string;
    categoryId?: string;
    createdBy?: string;
    assignedTo?: string[];
    startDate?: string;
    endDate?: string;
}

export interface SubTaskResponse {
    id: string;
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    mainTaskId?: string;
    projectId: string;
    category?: string;
    categoryId?: string;
    createdBy?: string;
    assignedTo: string[];
    startDate?: string;
    endDate?: string;
    createdAt?: string;
    comments?: Array<{
        authorId: string;
        content: string | null;
        createdAt: string;
    }>;
}

export const subTasksApi = {
    /**
     * Get all subtasks (optional: filter by projectId)
     * Backend path: GET /api/subtasks?projectId={projectId}
     */
    getSubTasks: async (projectId?: string): Promise<SubTaskResponse[]> => {
        const params = projectId ? { projectId } : undefined;
        const response = await axiosInstance.get<SubTaskResponse[]>('/api/subtasks', { params });
        return response.data;
    },

    /**
     * Get subtasks for the currently authenticated user
     * Backend path: GET /api/subtasks/me
     */
    getMySubTasks: async (): Promise<SubTaskResponse[]> => {
        const response = await axiosInstance.get<SubTaskResponse[]>('/api/subtasks/me');
        return response.data;
    },

    /**
     * Get subtasks involving a specific user (createdBy OR assignedTo)
     * Backend path: GET /api/subtasks/user/{userId}
     */
    getSubTasksByUser: async (userId: string): Promise<SubTaskResponse[]> => {
        const response = await axiosInstance.get<SubTaskResponse[]>(`/api/subtasks/user/${userId}`);
        return response.data;
    },

    /**
     * Get all subtasks for a specific project
     * Backend path: GET /api/subtasks/project/{projectId}
     */
    getSubTasksByProject: async (projectId: string): Promise<SubTaskResponse[]> => {
        const response = await axiosInstance.get<SubTaskResponse[]>(`/api/subtasks/project/${projectId}`);
        return response.data;
    },

    /**
     * Get subtask by ID
     * Backend path: GET /api/subtasks/{id}
     */
    getSubTaskById: async (subTaskId: string): Promise<SubTaskResponse> => {
        const response = await axiosInstance.get<SubTaskResponse>(`/api/subtasks/${subTaskId}`);
        return response.data;
    },

    /**
     * Create a new subtask
     * Backend path: POST /api/subtasks
     */
    createSubTask: async (subTaskData: CreateSubTaskData): Promise<SubTaskResponse> => {
        const response = await axiosInstance.post<SubTaskResponse>('/api/subtasks', subTaskData);
        return response.data;
    },

    /**
     * Replace a subtask (full update)
     * Backend path: PUT /api/subtasks/{id}
     */
    updateSubTask: async (subTaskId: string, subTaskData: UpdateSubTaskData): Promise<{ message: string }> => {
        const response = await axiosInstance.put<{ message: string }>(`/api/subtasks/${subTaskId}`, subTaskData);
        return response.data;
    },

    /**
     * Partial update of a subtask
     * Backend path: PATCH /api/subtasks/{id}
     */
    patchSubTask: async (subTaskId: string, updates: Partial<UpdateSubTaskData>): Promise<{ message: string }> => {
        const payload: Record<string, unknown> = {};

        // Only include fields that are provided
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.priority !== undefined && updates.priority !== '') payload.priority = updates.priority;
        if (updates.status !== undefined && updates.status !== '') payload.status = updates.status;
        if (updates.categoryId !== undefined && updates.categoryId !== '') payload.categoryId = updates.categoryId;
        if (updates.assignedTo !== undefined) payload.assignedTo = updates.assignedTo;
        if (updates.startDate !== undefined) payload.startDate = updates.startDate;
        if (updates.endDate !== undefined) payload.endDate = updates.endDate;

        const response = await axiosInstance.patch<{ message: string }>(`/api/subtasks/${subTaskId}`, payload);
        return response.data;
    },

    /**
     * Add a comment to a subtask
     * Backend path: POST /api/subtasks/{id}/comments
     */
    addComment: async (subTaskId: string, commentData: { authorId: string; text: string }): Promise<{
        authorId: string;
        content: string;
        createdAt: string;
    }> => {
        const payload = {
            authorId: commentData.authorId,
            text: commentData.text,
            createdAt: new Date().toISOString(),
        };
        const response = await axiosInstance.post<{
            authorId: string;
            content: string;
            createdAt: string;
        }>(`/api/subtasks/${subTaskId}/comments`, payload);
        return response.data;
    },

    /**
     * Update category of a subtask
     * Backend path: PATCH /api/subtasks/{id}/category
     */
    updateCategory: async (subTaskId: string, categoryData: { categoryId?: string; category?: string }): Promise<{ message: string }> => {
        const response = await axiosInstance.patch<{ message: string }>(`/api/subtasks/${subTaskId}/category`, categoryData);
        return response.data;
    },

    /**
     * Delete a subtask
     * Backend path: DELETE /api/subtasks/{id}
     */
    deleteSubTask: async (subTaskId: string): Promise<void> => {
        await axiosInstance.delete(`/api/subtasks/${subTaskId}`);
    },
};
