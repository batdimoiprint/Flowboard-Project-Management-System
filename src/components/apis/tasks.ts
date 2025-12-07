/*
 * DEPRECATED: This file has been refactored into:
 * - maintasks.ts (handles MainTask operations at /api/maintasks)
 * - subtasks.ts (handles SubTask operations at /api/subtasks)
 *
 * The old "Task" entity is now "SubTask" (detailed task with all properties)
 * The old "DetailedTask" entity is now "MainTask" (parent task with basic info)
 *
 * This file now re-exports the new APIs for backward compatibility.
 */

import { subTasksApi, type SubTaskResponse, type CreateSubTaskData } from './subtasks';

// Re-export types with backward-compatible names
export type CreateTaskData = CreateSubTaskData;
export type TaskResponse = SubTaskResponse;

// Legacy interface for backward compatibility
export interface LegacyTaskResponse extends SubTaskResponse {
    _id?: string; // Keep for backward compatibility
    status?: string; // Legacy field (not in SubTask model)
}

/**
 * Legacy tasksApi - now redirects to SubTasks API
 * SubTasks are the new "Tasks" with detailed information
 */
export const tasksApi = {
    /**
     * Create a new task (now SubTask)
     * Backend path: POST /api/subtasks
     */
    createTask: async (taskData: CreateTaskData): Promise<TaskResponse> => {
        return subTasksApi.createSubTask(taskData);
    },

    /**
     * Get all tasks (now SubTasks)
     * Backend path: GET /api/subtasks
     */
    getTasks: async (): Promise<TaskResponse[]> => {
        return subTasksApi.getSubTasks();
    },

    /**
     * Fetch all tasks for a project using query param projectId
     * Backend path: GET /api/subtasks?projectId={projectId}
     */
    getTasksByProject: async (projectId: string): Promise<TaskResponse[]> => {
        return subTasksApi.getSubTasks(projectId);
    },

    /**
     * Fetch tasks for the currently authenticated user (shortcut)
     * Backend path: GET /api/subtasks/me
     */
    getMyTasks: async (): Promise<TaskResponse[]> => {
        return subTasksApi.getMySubTasks();
    },

    /**
     * Fetch tasks for a specific user (createdBy OR assignedTo)
     * Backend path: GET /api/subtasks/user/{userId}
     */
    getTasksByUser: async (userId: string): Promise<TaskResponse[]> => {
        return subTasksApi.getSubTasksByUser(userId);
    },

    /**
     * Get task by ID
     * Backend path: GET /api/subtasks/{id}
     */
    getTaskById: async (taskId: string): Promise<TaskResponse> => {
        return subTasksApi.getSubTaskById(taskId);
    },

    /**
     * Update task (full update)
     * Backend path: PUT /api/subtasks/{id}
     */
    updateTask: async (taskId: string, taskData: Partial<CreateTaskData>): Promise<{ message: string }> => {
        return subTasksApi.updateSubTask(taskId, taskData);
    },

    /**
     * Partial update of a task
     * Backend path: PATCH /api/subtasks/{id}
     */
    patchTask: async (taskId: string, updates: Partial<CreateTaskData>): Promise<{ message: string }> => {
        return subTasksApi.patchSubTask(taskId, updates);
    },

    /**
     * Delete a task
     * Backend path: DELETE /api/subtasks/{id}
     */
    deleteTask: async (taskId: string): Promise<void> => {
        return subTasksApi.deleteSubTask(taskId);
    },

    /**
     * Add comment to a task
     * Backend path: POST /api/subtasks/{id}/comments
     */
    addComment: async (taskId: string, commentData: { authorId: string; text: string }): Promise<{
        authorId: string;
        content: string;
        createdAt: string;
    }> => {
        return subTasksApi.addComment(taskId, commentData);
    },

    /**
     * DEPRECATED: Update only the category of a task
     * Use patchTask instead
     * Backend path: PATCH /api/subtasks/{id}
     */
    patchTaskCategory: async (taskId: string, categoryId: string): Promise<{ message: string; categoryId: string; categoryName: string }> => {
        await subTasksApi.patchSubTask(taskId, { categoryId });
        return {
            message: 'Category updated.',
            categoryId: categoryId,
            categoryName: categoryId // SubTask doesn't return categoryName separately
        };
    },
};

// Re-export the new APIs for direct access
export { mainTasksApi } from './maintasks';
export { subTasksApi } from './subtasks';