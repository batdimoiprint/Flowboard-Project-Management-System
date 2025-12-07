export interface UpdateMainTaskData {
    title: string;
    description?: string;
}
import axiosInstance from './axiosInstance';
import type { SubTaskResponse } from './subtasks';

export interface CreateMainTaskData {
    title: string;
    description?: string;
}

export interface MainTaskResponse {
    id: string;
    title: string;
    description?: string;
    createdAt?: string;
    subTaskIds?: string[];
}

export const mainTasksApi = {
    /**
     * Get all main tasks
     * Backend path: GET /api/maintasks
     */
    getMainTasks: async (): Promise<MainTaskResponse[]> => {
        const response = await axiosInstance.get<MainTaskResponse[]>('/api/maintasks');
        return response.data;
    },

    /**
     * Get main task by ID
     * Backend path: GET /api/maintasks/{id}
     */
    getMainTaskById: async (mainTaskId: string): Promise<MainTaskResponse> => {
        const response = await axiosInstance.get<MainTaskResponse>(`/api/maintasks/${mainTaskId}`);
        return response.data;
    },

    /**
     * Create a new main task
     * Backend path: POST /api/maintasks
     */
    createMainTask: async (mainTaskData: CreateMainTaskData): Promise<MainTaskResponse> => {
        const response = await axiosInstance.post<MainTaskResponse>('/api/maintasks', mainTaskData);
        return response.data;
    },

    /**
     * Get all subtasks for a main task
     * Backend path: GET /api/maintasks/{id}/subtasks
     */
    getSubTasksForMainTask: async (mainTaskId: string): Promise<SubTaskResponse[]> => {
        const response = await axiosInstance.get<SubTaskResponse[]>(`/api/maintasks/${mainTaskId}/subtasks`);
        return response.data;
    },

    /**
     * Delete a main task
     * Backend path: DELETE /api/maintasks/{id}
     */
    deleteMainTask: async (mainTaskId: string): Promise<void> => {
        await axiosInstance.delete(`/api/maintasks/${mainTaskId}`);
    },

    /**
     * Update a main task
     * Backend path: PUT /api/maintasks/{id}
     */
    updateMainTask: async (mainTaskId: string, data: UpdateMainTaskData): Promise<void> => {
        await axiosInstance.put(`/api/maintasks/${mainTaskId}`, data);
    },
};
