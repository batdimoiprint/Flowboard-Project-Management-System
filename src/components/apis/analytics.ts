import axiosInstance from './axiosInstance';

export interface AnalyticsSummary {
    totalUsers: number;
    totalProjects: number;
    totalMainTasks: number;
    totalSubTasks: number;
    tasksCompleted: number;
    tasksPending: number;
    tasksOverdue: number;
    activeProjects: number;
    tasksInProgress: number;
    tasksToDo: number;
    tasksBlocked: number;
    tasksByStatus: Record<string, number>;
    tasksByPriority: Record<string, number>;
}

export interface TaskProgress {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    toDoTasks: number;
    blockedTasks: number;
    overdueTasks: number;
    completionPercentage: number;
    inProgressPercentage: number;
    remainingTasks: number;
    statusBreakdown: Record<string, number>;
}

export interface ProjectStats {
    projectId: string;
    projectName: string;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    teamSize: number;
}

export interface UserOverview {
    userId: string;
    userName: string;
    assignedTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
}

export interface TimelineDataPoint {
    date: string;
    tasksCreated: number;
    tasksCompleted: number;
}

export interface TopPerformer {
    userId: string;
    userName: string;
    firstName: string;
    lastName: string;
    tasksCompleted: number;
    completionRate: number;
}

export interface KanbanStats {
    projectId: string;
    projectName: string;
    categories: Array<{
        categoryId: string;
        categoryName: string;
        taskCount: number;
    }>;
    totalTasks: number;
}

export const analyticsApi = {
    /**
     * Get overall system summary statistics
     */
    async getSummary(projectId?: string): Promise<AnalyticsSummary> {
        const params = projectId ? `?projectId=${projectId}` : '';
        const response = await axiosInstance.get(`/api/analytics/summary${params}`);
        return response.data;
    },

    /**
     * Get project-specific statistics
     */
    async getProjectStats(projectId: string): Promise<ProjectStats> {
        const response = await axiosInstance.get(`/api/analytics/projects/${projectId}/stats`);
        return response.data;
    },

    /**
     * Get user overview (assignment summary)
     */
    async getUserOverview(userId: string): Promise<UserOverview> {
        const response = await axiosInstance.get(`/api/analytics/users/${userId}/overview`);
        return response.data;
    },

    /**
     * Get tasks timeline (task creation trends)
     */
    async getTasksTimeline(days: number = 30): Promise<TimelineDataPoint[]> {
        const response = await axiosInstance.get(`/api/analytics/tasks/timeline?days=${days}`);
        return response.data;
    },

    /**
     * Get task progress statistics
     */
    async getTaskProgress(projectId?: string, userId?: string): Promise<TaskProgress> {
        const params = new URLSearchParams();
        if (projectId) params.append('projectId', projectId);
        if (userId) params.append('userId', userId);
        const response = await axiosInstance.get(`/api/analytics/progress${params.toString() ? '?' + params.toString() : ''}`);
        return response.data;
    },

    /**
     * Get current user's task progress
     */
    async getMyProgress(): Promise<TaskProgress> {
        const response = await axiosInstance.get('/api/analytics/my-progress');
        return response.data;
    },

    /**
     * Get top performers by task completion
     */
    async getTopPerformers(limit: number = 5): Promise<TopPerformer[]> {
        const response = await axiosInstance.get(`/api/analytics/top-performers?limit=${limit}`);
        return response.data;
    },

    /**
     * Get Kanban board statistics for a project
     */
    async getKanbanStats(projectId: string): Promise<KanbanStats> {
        const response = await axiosInstance.get(`/api/analytics/kanban/${projectId}`);
        return response.data;
    },
};
